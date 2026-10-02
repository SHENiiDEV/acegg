@php($brand = config('app.name', 'ACEGG'))
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="dark light">
    <title>{{ $title ?? $brand }}</title>
</head>
<body style="margin:0;padding:0;background:#10131a;font-family:Outfit,'Segoe UI',Helvetica,Arial,sans-serif;color:#e8ecf3;">
    @isset($preheader)
        <div style="display:none;max-height:0;overflow:hidden;opacity:0;">{{ $preheader }}</div>
    @endisset
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#10131a;padding:32px 12px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
                    {{-- logo --}}
                    <tr>
                        <td style="padding:0 4px 20px;font-size:24px;font-weight:800;letter-spacing:-0.5px;color:#ffffff;">
                            <span style="color:#c9f73a;">&#9824;</span> ACE<span style="color:#c9f73a;">GG</span>
                        </td>
                    </tr>
                    {{-- card --}}
                    <tr>
                        <td style="background:#1b2029;border:1px solid #2a313d;border-radius:20px;overflow:hidden;">
                            @isset($hero)
                                <div style="background:linear-gradient(135deg,#1b3b78,#2f86ff);background-color:#1b3b78;padding:32px 28px;">
                                    {!! $hero !!}
                                </div>
                            @endisset
                            <div style="padding:28px;font-size:15px;line-height:1.6;color:#c9d1de;">
                                @yield('content')
                            </div>
                        </td>
                    </tr>
                    {{-- footer --}}
                    <tr>
                        <td style="padding:22px 6px;font-size:12px;line-height:1.6;color:#8a93a6;">
                            {{ $brand }} is a social casino operated by {{ config('company.name') }} (company no. {{ config('company.number') }}),
                            {{ config('company.address') }}. Coins have no cash value and cannot be withdrawn. 18+ only.<br>
                            Questions? <a href="mailto:{{ config('company.email') }}" style="color:#c9f73a;">{{ config('company.email') }}</a> ·
                            <a href="{{ url('/legal/terms') }}" style="color:#8a93a6;">Terms</a> ·
                            <a href="{{ url('/legal/privacy') }}" style="color:#8a93a6;">Privacy</a> ·
                            <a href="{{ url('/legal/responsible-gaming') }}" style="color:#8a93a6;">Responsible Gaming</a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
