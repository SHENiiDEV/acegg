<?php

namespace App\Http\Middleware;

use App\Services\SpinKit\SpinKitException;
use App\Services\Wallet\GameSessionService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

/**
 * When a player navigates anywhere outside a game, their coins are pulled
 * back from SpinKit so the lobby always shows the real balance.
 */
class SettleGameSession
{
    public function __construct(private readonly GameSessionService $sessions) {}

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Only a real page navigation means "the player left the game".
        // Background requests (notification polling, balance polling, prefetch) must
        // never close the SpinKit session — that caused 401 on /rgs/spin.
        if ($user?->isInGame()
            && $request->isMethod('GET')
            && ! $request->expectsJson()
            && ! $request->header('Purpose') // browser/Inertia prefetch
            && ! $request->routeIs('play.*', 'wallet.*', 'notifications.*')) {
            try {
                $this->sessions->settle($user);
            } catch (SpinKitException $e) {
                Log::warning('SpinKit settle failed', ['user' => $user->id, 'code' => $e->errorCode, 'message' => $e->getMessage()]);
            }
        }

        return $next($request);
    }
}
