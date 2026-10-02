@extends('emails.layout', [
    'title' => 'Welcome to '.config('app.name'),
    'preheader' => 'Confirm your email and start spinning — '.number_format(config('casino.welcome_bonus') / 100).' coins are waiting.',
    'hero' => '<div style="font-size:13px;font-weight:700;color:#c9f73a;text-transform:uppercase;letter-spacing:1px;">Welcome bonus</div>'
        .'<div style="font-size:34px;font-weight:800;color:#ffffff;line-height:1.1;margin-top:6px;">'.number_format(config('casino.welcome_bonus') / 100).' Coins</div>'
        .'<div style="font-size:14px;color:#dbe6ff;margin-top:6px;">are already in your balance</div>',
])

@section('content')
    <p style="margin:0 0 12px;font-size:18px;font-weight:700;color:#ffffff;">Hi {{ $user->first_name ?: $user->name }}, welcome to {{ config('app.name') }}!</p>
    <p style="margin:0;">Thanks for joining. Please confirm your email address so we can keep your account secure and send you receipts.</p>

    @include('emails.partials.button', ['url' => $url, 'label' => 'Confirm my email'])

    <p style="margin:0 0 6px;font-weight:700;color:#ffffff;">What's waiting for you</p>
    <ul style="margin:0;padding-left:18px;">
        <li>100+ slots — Megaways, Cluster Pays, Hold &amp; Win</li>
        <li>{{ number_format(config('casino.daily_bonus') / 100) }} free coins every 24 hours</li>
        <li>VIP Club with cashback and level-up rewards</li>
        <li>Hourly provably fair lottery</li>
    </ul>
    <p style="margin:20px 0 0;font-size:12px;color:#8a93a6;">If the button doesn't work, copy this link: <br><a href="{{ $url }}" style="color:#c9f73a;word-break:break-all;">{{ $url }}</a></p>
    <p style="margin:12px 0 0;font-size:12px;color:#8a93a6;">Didn't create an account? You can ignore this email.</p>
@endsection
