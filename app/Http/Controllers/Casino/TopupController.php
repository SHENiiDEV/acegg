<?php

namespace App\Http\Controllers\Casino;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Payments\PaymentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Inertia\Inertia;
use Inertia\Response;
use InvalidArgumentException;
use RuntimeException;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class TopupController extends Controller
{
    public function __construct(private readonly PaymentService $payments) {}

    public function index(Request $request): Response
    {
        $cfg = $this->payments->config();
        $user = $request->user();
        $defaultCurrency = $this->payments->defaultCurrency();
        $currCfg = $this->payments->currencyConfig($defaultCurrency);
        $allCurrencies = $this->payments->allCurrencies();

        return Inertia::render('casino/topup', [
            'currencies' => $allCurrencies,
            'defaultCurrency' => $defaultCurrency,
            'packages' => $this->payments->packages($defaultCurrency),
            'settings' => [
                'currency' => $currCfg['code'],
                'symbol' => $currCfg['symbol'],
                'coins_per_cent' => $currCfg['coins_per_cent'],
                'min' => $currCfg['min_amount'],
                'max' => $currCfg['max_amount'],
                'daily_limit' => $currCfg['daily_limit'],
                'sandbox' => ($cfg['driver'] ?? 'sandbox') === 'sandbox',
            ],
            'missingProfile' => $user ? $this->payments->missingProfileFields($user) : [],
            'recent' => $user ? Payment::where('user_id', $user->id)->latest()->limit(8)->get()->map->present() : [],
        ]);
    }

    public function store(Request $request): SymfonyResponse
    {
        $data = $request->validate([
            'currency' => ['nullable', 'string', 'max:10'],
            'package' => ['nullable', 'string', 'max:40'],
            'amount' => ['nullable', 'numeric', 'min:0'],
        ]);

        $user = $request->user();
        if ($missing = $this->payments->missingProfileFields($user)) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Please complete your personal details before buying coins.']);

            return redirect('/settings/profile');
        }

        try {
            $payment = $this->payments->create(
                $user,
                $data['package'] ?? null,
                isset($data['amount']) && empty($data['package']) ? (int) round(((float) $data['amount']) * 100) : null,
                $data['currency'] ?? null,
            );

            return Inertia::location($this->payments->gateway()->checkoutUrl($payment));
        } catch (InvalidArgumentException|RuntimeException $e) {
            Inertia::flash('toast', ['type' => 'error', 'message' => $e->getMessage()]);

            return back();
        }
    }

    /** Where the provider sends the player back after paying. */
    public function result(Request $request, Payment $payment): Response
    {
        abort_unless($payment->user_id === $request->user()->id, 404);

        return Inertia::render('casino/topup-result', ['payment' => $payment->present()]);
    }

    /** Download PDF invoice. */
    public function invoice(Request $request, Payment $payment): HttpResponse
    {
        abort_unless($payment->user_id === $request->user()->id, 404);

        $invoiceService = app(\App\Services\Invoice\InvoiceService::class);
        $pdf = $invoiceService->generatePdf($payment);
        $filename = $invoiceService->filename($payment);

        return response($pdf, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
        ]);
    }

    // ------------------------------------------------------------ sandbox checkout (dev only)

    public function sandbox(Request $request, Payment $payment): Response
    {
        abort_unless($payment->user_id === $request->user()->id, 404);

        return Inertia::render('casino/topup-sandbox', [
            'payment' => $payment->present(),
            'approveUrl' => $request->fullUrlWithQuery([]),
        ]);
    }

    public function sandboxDecide(Request $request, Payment $payment): RedirectResponse
    {
        abort_unless($payment->user_id === $request->user()->id && $payment->driver === 'sandbox', 404);

        $request->validate(['decision' => ['required', 'in:approve,decline']]);

        $request->input('decision') === 'approve'
            ? $this->payments->complete($payment, 'sandbox-'.now()->timestamp)
            : $this->payments->fail($payment, 'Declined in sandbox');

        return redirect()->route('topup.result', $payment);
    }

    // ------------------------------------------------------------ provider webhook

    public function webhook(Request $request): HttpResponse
    {
        $this->payments->gateway()->handleWebhook($request);

        return response('OK');
    }
}
