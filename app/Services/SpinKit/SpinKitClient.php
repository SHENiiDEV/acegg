<?php

namespace App\Services\SpinKit;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

/**
 * Thin wrapper around the SpinKit Merchant API (v2).
 * Every amount is an integer in minor units.
 */
class SpinKitClient
{
    public function __construct(
        private readonly string $baseUrl,
        private readonly ?string $token,
        private readonly ?string $signingSecret = null,
        private readonly int $timeout = 10,
    ) {}

    public static function fromConfig(): self
    {
        $cfg = config('services.spinkit');

        return new self($cfg['url'], $cfg['token'], $cfg['signing_secret'] ?: null, $cfg['timeout']);
    }

    public function isConfigured(): bool
    {
        return filled($this->token);
    }

    // ------------------------------------------------------------- games

    /**
     * Enabled games, cached. Returns [] when SpinKit is unreachable so the
     * lobby still renders.
     *
     * @return array<int, array<string, mixed>>
     */
    public function games(): array
    {
        if (! $this->isConfigured()) {
            return [];
        }

        $key = 'spinkit:games';
        $cached = Cache::get($key);
        if (is_array($cached)) {
            return $cached;
        }

        try {
            $games = $this->get('/api/v2/games')['games'] ?? [];
        } catch (SpinKitException) {
            return [];
        }

        Cache::put($key, $games, config('casino.games_cache_ttl'));

        return $games;
    }

    /** @return array<string, mixed>|null */
    public function findGame(string $gameId): ?array
    {
        foreach ($this->games() as $game) {
            if ($game['game_id'] === $gameId) {
                return $game;
            }
        }

        return null;
    }

    // ------------------------------------------------------------- players & wallet

    /**
     * Merchant account (float, limits, demo_refill flag), cached for 10 minutes.
     *
     * @return array<string, mixed>
     */
    public function merchant(): array
    {
        return Cache::remember('spinkit:merchant', 600, fn () => $this->get('/api/v2/merchant')['merchant'] ?? []);
    }

    /**
     * @return array{created: bool, player: array<string, mixed>}
     */
    public function ensurePlayer(string $externalId, string $username): array
    {
        $r = $this->post('/api/v2/players', ['external_id' => $externalId, 'username' => $username]);

        return ['created' => (bool) ($r['created'] ?? false), 'player' => $r['player']];
    }

    /** @return array<string, mixed> */
    public function player(string $externalId): array
    {
        return $this->get('/api/v2/players/'.rawurlencode($externalId))['player'];
    }

    /** @return array<string, mixed> */
    public function deposit(string $externalId, int $amount, string $txId): array
    {
        return $this->post('/api/v2/players/'.rawurlencode($externalId).'/deposit', ['amount' => $amount, 'tx_id' => $txId]);
    }

    /** @return array<string, mixed> */
    public function withdraw(string $externalId, int $amount, string $txId): array
    {
        return $this->post('/api/v2/players/'.rawurlencode($externalId).'/withdraw', ['amount' => $amount, 'tx_id' => $txId]);
    }

    // ------------------------------------------------------------- sessions

    /** @return array<string, mixed> */
    public function createSession(string $externalId, string $username, string $gameId, string $lobbyUrl): array
    {
        return $this->post('/api/v2/sessions', [
            'external_id' => $externalId,
            'username' => $username,
            'game_id' => $gameId,
            'lobby_url' => $lobbyUrl,
        ])['session'];
    }

    public function revokeSession(string $token): void
    {
        try {
            $this->send('DELETE', '/api/v2/sessions/'.rawurlencode($token));
        } catch (SpinKitException $e) {
            if ($e->status !== 404) {
                throw $e;
            }
        }
    }

    // ------------------------------------------------------------- feeds

    /** @return array<int, array<string, mixed>> */
    public function recentRounds(int $limit = 50): array
    {
        try {
            return $this->get('/api/v2/rounds', ['limit' => $limit])['rounds'] ?? [];
        } catch (SpinKitException) {
            return [];
        }
    }

    /** @return array<string, mixed> */
    public function jackpots(): array
    {
        try {
            return $this->get('/api/v2/jackpots');
        } catch (SpinKitException) {
            return ['enabled' => false, 'jackpots' => []];
        }
    }

    // ------------------------------------------------------------- transport

    /**
     * @param  array<string, mixed>  $query
     * @return array<string, mixed>
     */
    public function get(string $path, array $query = []): array
    {
        if ($query !== []) {
            $path .= '?'.http_build_query($query);
        }

        return $this->send('GET', $path);
    }

    /**
     * @param  array<string, mixed>  $body
     * @return array<string, mixed>
     */
    public function post(string $path, array $body): array
    {
        return $this->send('POST', $path, $body);
    }

    /**
     * @param  array<string, mixed>|null  $body
     * @return array<string, mixed>
     */
    private function send(string $method, string $path, ?array $body = null): array
    {
        $raw = $body === null ? '' : json_encode($body, JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);

        $request = $this->request($method, $path, $raw);
        if ($body !== null) {
            $request = $request->withBody($raw, 'application/json');
        }

        try {
            $response = $request->send($method, $this->baseUrl.$path);
        } catch (ConnectionException $e) {
            throw new SpinKitException('SpinKit is unreachable: '.$e->getMessage(), 'CONNECTION_FAILED');
        }

        return $this->decode($response);
    }

    private function request(string $method, string $path, string $raw): PendingRequest
    {
        $headers = ['Accept' => 'application/json'];

        if ($this->signingSecret) {
            $ts = (string) time();
            $headers['X-Timestamp'] = $ts;
            $headers['X-Signature'] = hash_hmac('sha256', "{$ts}.{$method}.{$path}.{$raw}", $this->signingSecret);
        }

        return Http::withToken((string) $this->token)
            ->withHeaders($headers)
            ->timeout($this->timeout);
    }

    /** @return array<string, mixed> */
    private function decode(Response $response): array
    {
        $json = $response->json();

        if ($response->failed()) {
            // SpinKit error shape: {"status":"error","error":"CODE","message":"..."}
            $code = is_array($json) && is_string($json['error'] ?? null) ? $json['error'] : null;
            $message = is_array($json) && is_string($json['message'] ?? null) ? $json['message'] : 'SpinKit request failed';

            throw new SpinKitException($message, $code, $response->status());
        }

        return is_array($json) ? $json : [];
    }
}
