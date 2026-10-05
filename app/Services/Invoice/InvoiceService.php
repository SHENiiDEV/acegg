<?php

namespace App\Services\Invoice;

use App\Models\Payment;
use Dompdf\Dompdf;
use Dompdf\Options;

class InvoiceService
{
    public function generatePdf(Payment $payment): string
    {
        $options = new Options();
        $options->set('isRemoteEnabled', true);
        $options->set('isHtml5ParserEnabled', true);
        $options->set('defaultFont', 'Helvetica');

        $dompdf = new Dompdf($options);

        $html = view('pdf.invoice', [
            'payment' => $payment,
            'user' => $payment->user,
            'company' => config('company'),
            'appName' => config('app.name', 'ACEGG'),
            'logoBase64' => $this->getLogoBase64(),
        ])->render();

        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        return (string) $dompdf->output();
    }

    public function filename(Payment $payment): string
    {
        return 'invoice-'.strtoupper(substr($payment->id, 0, 8)).'.pdf';
    }

    private function getLogoBase64(): ?string
    {
        $path = public_path('icon-192.png');
        if (file_exists($path)) {
            $type = pathinfo($path, PATHINFO_EXTENSION);
            $data = file_get_contents($path);

            return 'data:image/'.$type.';base64,'.base64_encode($data);
        }

        return null;
    }
}
