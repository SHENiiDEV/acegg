<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property string $id
 * @property int $user_id
 * @property string|null $package
 * @property int $amount
 * @property string $currency
 * @property int $coins
 * @property int $bonus_coins
 * @property string $status
 * @property string $driver
 * @property string|null $provider_ref
 * @property string|null $failure_reason
 * @property Carbon|null $paid_at
 */
class Payment extends Model
{
    use HasUuids;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'coins' => 'integer',
            'bonus_coins' => 'integer',
            'paid_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function totalCoins(): int
    {
        return $this->coins + $this->bonus_coins;
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /** @return array<string, mixed> */
    public function present(): array
    {
        return [
            'id' => $this->id,
            'package' => $this->package,
            'amount' => $this->amount,
            'currency' => $this->currency,
            'coins' => $this->coins,
            'bonus_coins' => $this->bonus_coins,
            'status' => $this->status,
            'failure_reason' => $this->failure_reason,
            'created_at' => $this->created_at?->toIso8601String(),
            'paid_at' => $this->paid_at?->toIso8601String(),
        ];
    }
}
