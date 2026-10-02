@extends('emails.layout', ['title' => 'Reset your password', 'preheader' => 'Reset your '.config('app.name').' password'])

@section('content')
    <p style="margin:0 0 12px;font-size:18px;font-weight:700;color:#ffffff;">Reset your password</p>
    <p style="margin:0;">We received a request to reset the password for your {{ config('app.name') }} account. This link is valid for {{ $expire }} minutes.</p>
    @include('emails.partials.button', ['url' => $url, 'label' => 'Choose a new password'])
    <p style="margin:0;font-size:13px;color:#8a93a6;">If you didn't ask for this, no action is needed — your password stays the same.</p>
@endsection
