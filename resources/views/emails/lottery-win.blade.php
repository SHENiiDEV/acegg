@extends('emails.layout', [
    'title' => 'Lottery win',
    'preheader' => 'You won '.$prize.' coins in round #'.$ticket->lottery_round_id,
    'hero' => '<div style="font-size:13px;font-weight:700;color:#c9f73a;text-transform:uppercase;letter-spacing:1px;">Round #'.$ticket->lottery_round_id.'</div>'
        .'<div style="font-size:34px;font-weight:800;color:#ffffff;line-height:1.1;margin-top:6px;">You won '.$prize.' Coins!</div>',
])

@section('content')
    <p style="margin:0 0 12px;font-size:18px;font-weight:700;color:#ffffff;">Congratulations, {{ $user->first_name ?: $user->name }}!</p>
    <p style="margin:0 0 14px;">Your ticket matched <b style="color:#ffffff;">{{ $ticket->matches }}</b> numbers. The prize is already in your balance.</p>
    <p style="margin:0 0 6px;font-size:13px;color:#8a93a6;">Your numbers</p>
    <p style="margin:0 0 4px;">
        @foreach ($ticket->numbers as $n)
            <span style="display:inline-block;width:34px;height:34px;line-height:34px;text-align:center;border-radius:17px;font-weight:800;margin-right:4px;{{ in_array($n, $drawn) ? 'background:#c9f73a;color:#173300;' : 'background:#2a313d;color:#8a93a6;' }}">{{ $n }}</span>
        @endforeach
    </p>
    @include('emails.partials.button', ['url' => url('/lottery'), 'label' => 'Play the next draw'])
@endsection
