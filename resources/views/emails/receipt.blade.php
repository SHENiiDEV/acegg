@extends('emails.layout', [
    'title' => 'Purchase receipt',
    'preheader' => $total.' coins added to your balance.',
    'hero' => '<div style="font-size:13px;font-weight:700;color:#c9f73a;text-transform:uppercase;letter-spacing:1px;">Payment successful</div>'
        .'<div style="font-size:34px;font-weight:800;color:#ffffff;line-height:1.1;margin-top:6px;">+'.$total.' Coins</div>'
        .'<div style="font-size:14px;color:#dbe6ff;margin-top:6px;">New balance: '.$balance.' coins</div>',
])

@section('content')
    <p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#ffffff;">Thanks for your purchase, {{ $user->first_name ?: $user->name }}!</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;border-collapse:collapse;">
        @foreach ([
            'Order' => '#'.strtoupper(substr($payment->id, 0, 8)),
            'Date' => $payment->paid_at?->format('d M Y, H:i').' UTC',
            'Package' => $payment->package ? ucfirst($payment->package) : 'Custom amount',
            'Coins' => $coins,
            'Bonus coins' => $bonus !== '0' ? '+'.$bonus : '—',
        ] as $label => $value)
            <tr>
                <td style="padding:9px 0;border-bottom:1px solid #2a313d;color:#8a93a6;">{{ $label }}</td>
                <td style="padding:9px 0;border-bottom:1px solid #2a313d;color:#ffffff;text-align:right;font-weight:600;">{{ $value }}</td>
            </tr>
        @endforeach
        <tr>
            <td style="padding:12px 0;color:#ffffff;font-weight:800;">Total paid</td>
            <td style="padding:12px 0;color:#c9f73a;text-align:right;font-weight:800;font-size:18px;">{{ $price }}</td>
        </tr>
    </table>
    @include('emails.partials.button', ['url' => url('/games'), 'label' => 'Start playing'])
    <p style="margin:0;font-size:12px;color:#8a93a6;">Coins are a virtual currency for entertainment only. They have no cash value and cannot be withdrawn or exchanged. See our
        <a href="{{ url('/legal/payments-refunds') }}" style="color:#c9f73a;">Payments &amp; Refunds</a> policy.</p>
@endsection
