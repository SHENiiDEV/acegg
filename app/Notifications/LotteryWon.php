<?php

namespace App\Notifications;

use App\Models\LotteryTicket;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class LotteryWon extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public LotteryTicket $ticket)
    {
        $this->afterCommit();
    }

    /** @return array<int, string> */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function viaConnections(): array
    {
        return ['database' => 'sync'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $t = $this->ticket;

        return (new MailMessage)
            ->subject('You won '.number_format($t->prize / 100).' coins in the '.config('app.name').' lottery!')
            ->view('emails.lottery-win', [
                'user' => $notifiable,
                'ticket' => $t,
                'drawn' => $t->round?->numbers ?? [],
                'prize' => number_format($t->prize / 100),
            ]);
    }

    /** @return array<string, mixed> */
    public function toArray(object $notifiable): array
    {
        return [
            'kind' => 'lottery_win',
            'title' => 'Lottery win! 🎉',
            'body' => "Round #{$this->ticket->lottery_round_id}: {$this->ticket->matches} matches — +".number_format($this->ticket->prize / 100).' coins.',
            'amount' => $this->ticket->prize,
            'url' => '/lottery',
        ];
    }
}
