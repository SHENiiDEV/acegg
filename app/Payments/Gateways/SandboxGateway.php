<?php

namespace App\Payments\Gateways;

use App\Models\Payment;
use App\Payments\PaymentGateway;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;

/**
 * Test checkout for development: shows a page with "Approve" / "Decline".
 * No money moves. Disabled in production unless PAYMENT_SANDBOX_IN_PRODUCTION=true.
 */
class SandboxGateway implements PaymentGateway
{
    public function checkoutUrl(Payment $payment): string
    {
        return URL::temporarySignedRoute('topup.sandbox', now()->addMinutes(30), ['payment' => $payment->id]);
    }

    public function handleWebhook(Request $request): ?Payment
    {
        return null; // sandbox completes payments directly from its own page
    }
}
