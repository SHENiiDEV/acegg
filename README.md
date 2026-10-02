# ACEGG — Social Casino

Laravel 13 + Inertia (React 19) + Tailwind v4. Games come from **SpinKit RGS** (Merchant API v2).
Players use free virtual **Coins** (no real money).

## Quick start

```bash
composer install
npm install
php artisan key:generate
touch database/database.sqlite
php artisan migrate
composer run dev        # Laravel on :8000 + Vite
```

SpinKit must be running (default `http://localhost:3000`).

## .env

| Key                                                                  | What                                                   |
| -------------------------------------------------------------------- | ------------------------------------------------------ |
| `COMPANY_NAME`, `COMPANY_NUMBER`, `COMPANY_ADDRESS`, `COMPANY_EMAIL` | Operator details in the footer and on `/legal/*` pages |
| `SPINKIT_URL`                                                        | SpinKit base URL                                       |
| `SPINKIT_TOKEN`                                                      | Merchant API token (`sk_live_…`)                       |
| `SPINKIT_SIGNING_SECRET`                                             | Only if request signing is enabled for the merchant    |
| `CASINO_WELCOME_BONUS` / `CASINO_DAILY_BONUS`                        | In minor units: `500000` = 5,000.00 coins              |
| `CASINO_PLAYER_PREFIX`                                               | SpinKit `external_id` = prefix + user id               |

### SpinKit merchant settings (important)

In SpinKit admin → Merchants, for the merchant whose token you use:

- **`demo_refill` must be OFF.** With it on, SpinKit gives every player free credits and an in-game refill
  button; the app would withdraw those into user coins. The app refuses to launch games while it's on.
- **Float: unlimited** (or top it up) — every game launch deposits the player's coins from the float.

## How the wallet works (transfer wallet)

1. User opens `/play/{game}` → app deposits the whole coin balance to SpinKit (`tx_id` idempotent) and creates a session; `launch_url` is shown in an iframe.
2. User goes back to any lobby page (or presses the in-game lobby button → `lobby_url`) → middleware `SettleGameSession` withdraws the SpinKit balance back into coins and revokes the session.
3. Ledger: `wallet_transactions` (welcome_bonus, daily_bonus, game_in, game_out).

## Code map

- `app/Services/SpinKit/SpinKitClient.php` — API client (Bearer, optional HMAC signing, error codes)
- `app/Services/Wallet/` — coins, game session launch/settle, bonuses
- `app/Http/Controllers/Casino/` — lobby, play, bonus
- `resources/js/layouts/casino-layout.tsx` — header / sidebar / live chat / footer
- `resources/js/pages/casino/` — home, games, play; `resources/js/pages/legal/show.tsx`
- `resources/js/components/casino/art.tsx` — logo and illustrations (swap for real brand art)

## Not done yet (placeholders in the UI)

Live chat (UI only, needs Reverb/Pusher), VIP Club, Lottery, Weekly race, Sportsbook — marked “soon”.
Legal texts are templates — have them reviewed.

## Top up (coin purchases)

- Packages and limits: `config/payments.php` (`TOPUP_*` in .env). €1 = 10,000 coins by default.
- `PAYMENT_DRIVER=sandbox` shows a test checkout (Approve / Decline). It is blocked in production.
- To connect a real provider: create `app/Payments/Gateways/<Name>Gateway.php` implementing
  `App\Payments\PaymentGateway` (`checkoutUrl()` + `handleWebhook()` with signature check), register it in
  `config/payments.php → gateways`, set `PAYMENT_DRIVER`, and point the provider's webhook to `POST /payments/webhook`.
  Inside the webhook call `PaymentService::complete($payment, $providerRef)` or `fail()`; `complete()` is idempotent.
- Players must fill in their personal details (name, phone, DOB, address) before buying.

## Email (Namecheap Private Email)

Set in .env: `MAIL_MAILER=smtp`, `MAIL_SCHEME=smtps`, `MAIL_HOST=mail.privateemail.com`, `MAIL_PORT=465`,
`MAIL_USERNAME` / `MAIL_FROM_ADDRESS` = your mailbox, `MAIL_PASSWORD`.
Emails: welcome + email confirmation (on registration), password reset, purchase receipt, lottery win
(templates in `resources/views/emails`). Receipts and win emails are queued — keep a worker running:
`php artisan queue:work`. Until SMTP is configured, `MAIL_MAILER=log` writes them to `storage/logs/laravel.log`.

## Notifications

Database notifications (bell in the header): top-ups and lottery wins. The bell polls every 20 s and shows a toast
for new ones.

## Scheduler

`php artisan schedule:work` (locally) or a cron `* * * * * php artisan schedule:run` — runs the hourly lottery draw.
