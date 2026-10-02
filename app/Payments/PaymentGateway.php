<?php

namespace App\Payments;

use App\Models\Payment;
use Illuminate\Http\Request;

/**
 * Contract every payment provider implements.
 *
 * Flow: checkoutUrl() → user pays on the provider page → provider calls our
 * webhook (handleWebhook) and/or sends the user back to route('topup.return').
 * Call PaymentService::complete()/fail() from the webhook — never trust the return URL alone.
 */
interface PaymentGateway
{
    /** URL the player is redirected to for paying this order. */
    public function checkoutUrl(Payment $payment): string;

    /**
     * Verify and process a provider callback (signature check!).
     * Return the affected payment or null if the request is not for us.
     */
    public function handleWebhook(Request $request): ?Payment;
}
