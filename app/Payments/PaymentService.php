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

    public function defaultCurrency(): string
    {
        $default = strtoupper((string) ($this->config()['currency'] ?? 'GBP'));

        return isset($this->config()['currencies'][$default]) ? $default : 'GBP';
    }

    /** @return array<string, mixed> */
    public function currencyConfig(?string $currency = null): array
    {
        $currency = strtoupper((string) ($currency ?: $this->defaultCurrency()));
        $currencies = $this->config()['currencies'] ?? [];

        if (isset($currencies[$currency])) {
            return $currencies[$currency];
        }

        $def = $this->defaultCurrency();
        if (isset($currencies[$def])) {
            return $currencies[$def];
        }

        return [
            'code' => $this->config()['currency'] ?? 'GBP',
            'symbol' => $this->config()['currency_symbol'] ?? '£',
            'name' => ($this->config()['currency'] ?? 'GBP').' ('.($this->config()['currency_symbol'] ?? '£').')',
            'coins_per_cent' => $this->config()['coins_per_cent'] ?? 12_000,
            'min_amount' => $this->config()['min_amount'] ?? 400,
            'max_amount' => $this->config()['max_amount'] ?? 85_000,
            'daily_limit' => $this->config()['daily_limit'] ?? 170_000,
            'presets' => [10, 25, 50, 100],
            'prices' => [
                'starter' => 450,
                'basic' => 900,
                'popular' => 2250,
                'pro' => 4500,
                'highroller' => 9000,
                'whale' => 22500,
            ],
        ];
    }

    public function gateway(): PaymentGateway
    {
        $driver = $this->config()['driver'];
        if ($driver === 'sandbox' && app()->isProduction() && ! ($this->config()['sandbox_in_production'] ?? false)) {
            throw new RuntimeException('Payments are not configured yet.');
        }
        $class = $this->config()['gateways'][$driver] ?? throw new RuntimeException("Unknown payment driver [{$driver}].");

        return app($class);
    }

    /** @return array<int, array<string, mixed>> */
    public function packages(?string $currency = null): array
    {
        $currCfg = $this->currencyConfig($currency);
        $rawPackages = $this->config()['packages'] ?? [];

        return array_map(function (array $p) use ($currCfg) {
            $price = $currCfg['prices'][$p['id']] ?? ($p['price'] ?? 500);
            $bonus = $p['bonus'] ?? 0;
            $base = $price * $currCfg['coins_per_cent'];

            return [
                'id' => $p['id'],
                'name' => $p['name'],
                'price' => $price,
                'bonus' => $bonus,
                'badge' => $p['badge'] ?? null,
                'coins' => $base,
                'bonus_coins' => intdiv($base * $bonus, 100),
            ];
        }, $rawPackages);
    }

    /** @return array<string, array<string, mixed>> */
    public function allCurrencies(): array
    {
        $currencies = $this->config()['currencies'] ?? [];
        $result = [];

        foreach ($currencies as $code => $c) {
            $result[$code] = [
                'code' => $c['code'],
                'symbol' => $c['symbol'],
                'name' => $c['name'],
                'coins_per_cent' => $c['coins_per_cent'],
                'min' => $c['min_amount'],
                'max' => $c['max_amount'],
                'daily_limit' => $c['daily_limit'],
                'presets' => $c['presets'] ?? [10, 25, 50, 100],
                'packages' => $this->packages($code),
            ];
        }

        return $result;
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

    public function create(User $user, ?string $packageId, ?int $customAmount, ?string $currency = null): Payment
    {
        $cfg = $this->config();
        $currCfg = $this->currencyConfig($currency);
        $currCode = $currCfg['code'];
        $currSymbol = $currCfg['symbol'];

        if ($packageId !== null) {
            $packages = $this->packages($currCode);
            $package = collect($packages)->firstWhere('id', $packageId)
                ?? throw new InvalidArgumentException('Unknown package.');
            [$amount, $coins, $bonus] = [$package['price'], $package['coins'], $package['bonus_coins']];
        } else {
            $amount = (int) $customAmount;
            if ($amount <= 0) {
                throw new InvalidArgumentException('Please enter a valid amount.');
            }
            [$coins, $bonus] = [$amount * $currCfg['coins_per_cent'], 0];
        }

        return Payment::create([
            'user_id' => $user->id,
            'package' => $packageId,
            'amount' => $amount,
            'currency' => $currCode,
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
