<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property Carbon $draws_at
 * @property string $status
 * @property string $seed_hash
 * @property string $server_seed
 * @property array<int, int>|null $numbers
 * @property int $pool
 * @property int $carried_over
 * @property int $paid_out
 * @property int $tickets_count
 * @property Carbon|null $drawn_at
 */
class LotteryRound extends Model
{
    protected $guarded = [];

    protected $hidden = ['server_seed'];

    protected function casts(): array
    {
        return [
            'draws_at' => 'datetime',
            'drawn_at' => 'datetime',
            'numbers' => 'array',
            'pool' => 'integer',
            'carried_over' => 'integer',
            'paid_out' => 'integer',
            'tickets_count' => 'integer',
        ];
    }

    /** @return HasMany<LotteryTicket, $this> */
    public function tickets(): HasMany
    {
        return $this->hasMany(LotteryTicket::class);
    }

    public function isOpen(): bool
    {
        return $this->status === 'open';
    }
}
