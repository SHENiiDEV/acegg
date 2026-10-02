<?php

namespace App\Payments;

use App\Models\Payment;
use App\Models\User;
use App\Models\WalletTransaction;
use App\Notifications\TopupCompleted;
use App\Services\Wallet\WalletService;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;
use RuntimeException;

class PaymentService
{
    public function __construct(private readonly WalletService $wallet) {}

    /** @return array<string, mixed> */
    public function config(): array
    {
        return config('payments');
    }

    public function gateway(): PaymentGateway
    {
        $driver = $this->config()['driver'];
        if ($driver === 'sandbox' && app()->isProduction() && ! $this->config()['sandbox_in_production']) {
            throw new RuntimeException('Payments are not configured yet.');
        }
        $class = $this->config()['gateways'][$driver] ?? throw new RuntimeException("Unknown payment driver [{$driver}].");

        return app($class);
    }

    /** @return array<int, array<string, mixed>> */
    public function packages(): array
    {
        return array_map(function (array $p) {
            $base = $p['price'] * $this->config()['coins_per_cent'];

            return [...$p, 'coins' => $base, 'bonus_coins' => intdiv($base * $p['bonus'], 100)];
        }, $this->config()['packages']);
    }

    /**
     * Player details required by card schemes / payment providers.
     *
     * @return array<int, string> missing field names
     */
    public function missingProfileFields(User $user): array
    {
        return array_values(array_filter(
            ['first_name', 'last_name', 'phone', 'date_of_birth', 'address_line', 'city', 'country', 'postcode'],
            fn ($f) => blank($user->{$f}),
        ));
    }

    public function create(User $user, ?string $packageId, ?int $customAmount): Payment
    {
        $cfg = $this->config();

        if ($packageId !== null) {
            $package = collect($this->packages())->firstWhere('id', $packageId)
                ?? throw new InvalidArgumentException('Unknown package.');
            [$amount, $coins, $bonus] = [$package['price'], $package['coins'], $package['bonus_coins']];
        } else {
            $amount = (int) $customAmount;
            if ($amount < $cfg['min_amount'] || $amount > $cfg['max_amount']) {
                throw new InvalidArgumentException(sprintf(
                    'Amount must be between %s%s and %s%s.',
                    $cfg['currency_symbol'], number_format($cfg['min_amount'] / 100, 2),
                    $cfg['currency_symbol'], number_format($cfg['max_amount'] / 100, 2),
                ));
            }
            [$coins, $bonus] = [$amount * $cfg['coins_per_cent'], 0];
        }

        $spent = (int) Payment::where('user_id', $user->id)->where('status', 'paid')
            ->where('paid_at', '>=', now()->subDay())->sum('amount');
        if ($spent + $amount > $cfg['daily_limit']) {
            throw new InvalidArgumentException(sprintf('Daily purchase limit of %s%s reached.', $cfg['currency_symbol'], number_format($cfg['daily_limit'] / 100, 2)));
        }

        return Payment::create([
            'user_id' => $user->id,
            'package' => $packageId,
            'amount' => $amount,
            'currency' => $cfg['currency'],
            'coins' => $coins,
            'bonus_coins' => $bonus,
            'status' => 'pending',
            'driver' => $cfg['driver'],
        ]);
    }

    /** Mark paid and credit coins exactly once (safe for repeated webhooks). */
    public function complete(Payment $payment, ?string $providerRef = null): Payment
    {
        $completed = DB::transaction(function () use ($payment, $providerRef) {
            /** @var Payment $locked */
            $locked = Payment::whereKey($payment->id)->lockForUpdate()->firstOrFail();
            if ($locked->status === 'paid') {
                return null;
            }

            $locked->forceFill(['status' => 'paid', 'paid_at' => now(), 'provider_ref' => $providerRef ?? $locked->provider_ref])->save();
            $this->wallet->credit($locked->user, $locked->totalCoins(), WalletTransaction::PURCHASE, 'payment-'.$locked->id);

            return $locked;
        });

        if ($completed) {
            $completed->user->notify(new TopupCompleted($completed));

            return $completed;
        }

        return $payment->refresh();
    }

    public function fail(Payment $payment, string $reason): Payment
    {
        Payment::whereKey($payment->id)->where('status', 'pending')
            ->update(['status' => 'failed', 'failure_reason' => $reason, 'updated_at' => now()]);

        return $payment->refresh();
    }
}
