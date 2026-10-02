<?php

namespace App\Http\Controllers\Casino;

use App\Http\Controllers\Controller;
use App\Services\SpinKit\SpinKitException;
use App\Services\Vip\VipService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class VipController extends Controller
{
    public function __construct(private readonly VipService $vip) {}

    public function show(Request $request): Response
    {
        $user = $request->user();

        if ($user) {
            try {
                $this->vip->sync($user);
            } catch (SpinKitException) {
                // show last known progress
            }
        }

        return Inertia::render('casino/vip', [
            'vip' => $user ? $this->vip->overview($user) : null,
            'levels' => $this->vip->levels(),
        ]);
    }

    public function claimMission(Request $request, string $mission): RedirectResponse
    {
        return $this->claim(fn () => $this->vip->claimMission($request->user(), $mission));
    }

    public function claimLevel(Request $request, int $level): RedirectResponse
    {
        return $this->claim(fn () => $this->vip->claimLevelReward($request->user(), $level));
    }

    public function claimCashback(Request $request): RedirectResponse
    {
        return $this->claim(fn () => $this->vip->claimCashback($request->user()));
    }

    private function claim(callable $fn): RedirectResponse
    {
        try {
            $amount = $fn();
            Inertia::flash('toast', ['type' => 'success', 'message' => '+'.number_format($amount / 100, 2).' coins credited!']);
        } catch (RuntimeException $e) {
            Inertia::flash('toast', ['type' => 'error', 'message' => $e->getMessage()]);
        }

        return back();
    }
}
