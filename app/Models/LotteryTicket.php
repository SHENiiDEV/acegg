<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $lottery_round_id
 * @property int $user_id
 * @property array<int, int> $numbers
 * @property int|null $matches
 * @property int $prize
 */
class LotteryTicket extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return ['numbers' => 'array', 'matches' => 'integer', 'prize' => 'integer'];
    }

    /** @return BelongsTo<LotteryRound, $this> */
    public function round(): BelongsTo
    {
        return $this->belongsTo(LotteryRound::class, 'lottery_round_id');
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
