<?php

namespace App\Http\Controllers\Casino;

use App\Http\Controllers\Controller;
use App\Services\SpinKit\SpinKitClient;
use App\Support\GamePresenter;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LobbyController extends Controller
{
    public function __construct(private readonly SpinKitClient $spinKit) {}

    public function home(): Response
    {
        return Inertia::render('casino/home', [
            'games' => GamePresenter::cards($this->spinKit->games()),
            'welcomeBonus' => (int) config('casino.welcome_bonus'),
            'spinKitOnline' => $this->spinKit->isConfigured() && $this->spinKit->games() !== [],
        ]);
    }

    public function games(Request $request): Response
    {
        return Inertia::render('casino/games', [
            'games' => GamePresenter::cards($this->spinKit->games()),
            'filter' => $request->string('filter')->toString() ?: 'all',
            'search' => $request->string('q')->toString(),
            'theme' => $request->string('theme')->toString() ?: 'all',
        ]);
    }
}
