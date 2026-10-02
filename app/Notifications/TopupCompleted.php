<?php

namespace App\Notifications;

use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TopupCompleted extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Payment $payment)
    {
        $this->afterCommit();
    }

    /** @return array<int, string> */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    /** On-site notification is written immediately; only the email waits for the queue. */
    public function viaConnections(): array
    {
        return ['database' => 'sync'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $p = $this->payment;
        $symbol = config('payments.currency_symbol');

        return (new MailMessage)
            ->subject('Your '.config('app.name').' purchase receipt — '.number_format($p->totalCoins() / 100).' coins')
            ->view('emails.receipt', [
                'user' => $notifiable,
                'payment' => $p,
                'price' => $symbol.number_format($p->amount / 100, 2),
                'coins' => number_format($p->coins / 100),
                'bonus' => number_format($p->bonus_coins / 100),
                'total' => number_format($p->totalCoins() / 100),
                'balance' => number_format($notifiable->fresh()->balance / 100, 2),
            ]);
    }

    /** @return array<string, mixed> */
    public function toArray(object $notifiable): array
    {
        return [
            'kind' => 'topup',
            'title' => 'Top-up successful',
            'body' => '+'.number_format($this->payment->totalCoins() / 100).' coins added to your balance.',
            'amount' => $this->payment->totalCoins(),
            'url' => '/topup/'.$this->payment->id,
        ];
    }
}
