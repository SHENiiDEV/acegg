<?php

namespace App\Http\Controllers\Casino;

use App\Http\Controllers\Controller;
use App\Services\SpinKit\SpinKitClient;
use App\Services\SpinKit\SpinKitException;
use App\Services\Wallet\GameSessionService;
use App\Support\GamePresenter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class PlayController extends Controller
{
    public function __construct(
        private readonly SpinKitClient $spinKit,
        private readonly GameSessionService $sessions,
    ) {}

    public function show(Request $request, string $gameId): Response|RedirectResponse
    {
        $game = $this->spinKit->findGame($gameId);
        abort_if($game === null, 404);

        try {
            $session = $this->sessions->launch($request->user(), $gameId, route('home'));
        } catch (SpinKitException $e) {
            Log::warning('SpinKit launch failed', ['game' => $gameId, 'code' => $e->errorCode, 'message' => $e->getMessage()]);

            Inertia::flash('toast', ['type' => 'error', 'message' => $this->friendly($e)]);

            return redirect()->route('home');
        }

        $related = collect($this->spinKit->games())
            ->where('game_id', '!=', $gameId)
            ->where('category', $game['category'])
            ->take(6)
            ->values()
            ->all();

        return Inertia::render('casino/play', [
            'game' => GamePresenter::card($game),
            'launchUrl' => $session['launch_url'],
            'related' => GamePresenter::cards($related),
        ]);
    }

    /** Close the game explicitly: coins come back to the main balance. */
    public function leave(Request $request): RedirectResponse
    {
        try {
            $this->sessions->settle($request->user());
        } catch (SpinKitException $e) {
            Log::warning('SpinKit settle failed', ['code' => $e->errorCode, 'message' => $e->getMessage()]);
        }

        return redirect()->route('home');
    }

    public function balance(Request $request): JsonResponse
    {
        return response()->json(['balance' => $this->sessions->liveBalance($request->user())]);
    }

    private function friendly(SpinKitException $e): string
    {
        // Locally show the real reason — production players only see the generic text.
        if (app()->isLocal() && $e->errorCode === 'MERCHANT_MISCONFIGURED') {
            return 'SpinKit merchant has demo_refill ON. Turn it off in SpinKit admin → Merchants, then run php artisan cache:clear.';
        }

        return match ($e->errorCode) {
            'GAME_DISABLED' => 'This game is currently unavailable.',
            'PLAYER_BLOCKED' => 'Your game account is blocked. Please contact support.',
            'INSUFFICIENT_FLOAT', 'MERCHANT_SUSPENDED', 'MERCHANT_MISCONFIGURED' => 'Games are temporarily unavailable. Please try again later.',
            'CONNECTION_FAILED' => 'Game server is not reachable right now.',
            default => 'Could not start the game. Please try again.',
        };
    }
}
