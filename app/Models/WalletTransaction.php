<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $user_id
 * @property string $type
 * @property int $amount
 * @property int $balance_after
 * @property string|null $reference
 * @property string|null $game_id
 */
#[Fillable(['user_id', 'type', 'amount', 'balance_after', 'reference', 'game_id'])]
class WalletTransaction extends Model
{
    public const WELCOME_BONUS = 'welcome_bonus';

    public const DAILY_BONUS = 'daily_bonus';

    public const GAME_IN = 'game_in';

    public const GAME_OUT = 'game_out';

    public const VIP_REWARD = 'vip_reward';

    public const PURCHASE = 'purchase';

    public const CASHBACK = 'cashback';

    public const LOTTERY_TICKET = 'lottery_ticket';

    public const LOTTERY_WIN = 'lottery_win';

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
