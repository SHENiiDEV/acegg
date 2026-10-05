<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Invoice #{{ strtoupper(substr($payment->id, 0, 8)) }}</title>
    <style>
        @page {
            margin: 30px 40px;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1a202c;
            font-size: 13px;
            line-height: 1.5;
            margin: 0;
            padding: 0;
        }
        .header-table {
            width: 100%;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 20px;
            margin-bottom: 25px;
        }
        .logo-img {
            width: 48px;
            height: 48px;
            vertical-align: middle;
        }
        .brand-name {
            font-size: 24px;
            font-weight: 800;
            color: #0f172a;
            vertical-align: middle;
            margin-left: 10px;
            letter-spacing: -0.5px;
        }
        .invoice-title {
            text-align: right;
        }
        .invoice-title h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 800;
            color: #0f172a;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .invoice-badge {
            display: inline-block;
            background-color: #dcfce7;
            color: #15803d;
            font-size: 11px;
            font-weight: 700;
            padding: 3px 8px;
            border-radius: 4px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 5px;
        }
        .details-table {
            width: 100%;
            margin-bottom: 30px;
        }
        .details-col {
            width: 50%;
            vertical-align: top;
        }
        .section-label {
            font-size: 11px;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 6px;
        }
        .details-name {
            font-size: 14px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 2px;
        }
        .details-text {
            color: #475569;
            font-size: 12px;
            line-height: 1.4;
        }
        .meta-table {
            width: 100%;
            margin-top: 5px;
        }
        .meta-table td {
            font-size: 12px;
            padding: 2px 0;
        }
        .meta-label {
            color: #64748b;
            width: 120px;
        }
        .meta-value {
            color: #0f172a;
            font-weight: 600;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
        }
        .items-table th {
            background-color: #0f172a;
            color: #ffffff;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 10px 12px;
            text-align: left;
        }
        .items-table th.text-right {
            text-align: right;
        }
        .items-table th.text-center {
            text-align: center;
        }
        .items-table td {
            padding: 12px;
            border-bottom: 1px solid #e2e8f0;
            color: #334155;
            font-size: 12px;
        }
        .items-table td.text-right {
            text-align: right;
        }
        .items-table td.text-center {
            text-align: center;
        }
        .item-title {
            font-weight: 700;
            color: #0f172a;
            font-size: 13px;
        }
        .item-desc {
            font-size: 11px;
            color: #64748b;
            margin-top: 2px;
        }
        .summary-table {
            width: 100%;
            margin-bottom: 35px;
        }
        .summary-table td {
            vertical-align: top;
        }
        .totals-box {
            width: 260px;
            float: right;
            border-collapse: collapse;
        }
        .totals-box td {
            padding: 6px 0;
            font-size: 12px;
        }
        .totals-box .total-row td {
            padding-top: 10px;
            border-top: 2px solid #0f172a;
            font-size: 15px;
            font-weight: 800;
            color: #0f172a;
        }
        .totals-box .coins-highlight {
            background-color: #f8fafc;
            padding: 8px 12px;
            border-radius: 6px;
            margin-top: 10px;
            border: 1px solid #e2e8f0;
        }
        .footer {
            border-top: 1px solid #e2e8f0;
            padding-top: 15px;
            text-align: center;
            font-size: 11px;
            color: #94a3b8;
            line-height: 1.5;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <table class="header-table" cellpadding="0" cellspacing="0">
        <tr>
            <td style="vertical-align: middle;">
                @if($logoBase64)
                    <img src="{{ $logoBase64 }}" class="logo-img" alt="{{ $appName }}">
                @endif
                <span class="brand-name">{{ $appName }}</span>
            </td>
            <td class="invoice-title" style="vertical-align: middle;">
                <h1>INVOICE / RECEIPT</h1>
                <div class="invoice-badge">Paid &amp; Verified</div>
            </td>
        </tr>
    </table>

    <!-- Info details -->
    <table class="details-table" cellpadding="0" cellspacing="0">
        <tr>
            <!-- Issuer info -->
            <td class="details-col">
                <div class="section-label">Issued By</div>
                <div class="details-name">{{ $company['name'] ?? $appName }}</div>
                <div class="details-text">
                    {{ $company['address'] ?? 'London, United Kingdom' }}<br>
                    @if(!empty($company['number']) && $company['number'] !== '000000')
                        Company No: {{ $company['number'] }}<br>
                    @endif
                    Email: {{ $company['email'] ?? 'support@acegg.co.uk' }}
                </div>
            </td>

            <!-- Invoice metadata & Billed to -->
            <td class="details-col" style="padding-left: 30px;">
                <div class="section-label">Invoice Details</div>
                <table class="meta-table" cellpadding="0" cellspacing="0">
                    <tr>
                        <td class="meta-label">Invoice Number:</td>
                        <td class="meta-value">#INV-{{ strtoupper(substr($payment->id, 0, 8)) }}</td>
                    </tr>
                    <tr>
                        <td class="meta-label">Date of Issue:</td>
                        <td class="meta-value">{{ $payment->paid_at ? $payment->paid_at->format('d M Y, H:i') : now()->format('d M Y, H:i') }} UTC</td>
                    </tr>
                    <tr>
                        <td class="meta-label">Payment Ref:</td>
                        <td class="meta-value">{{ $payment->provider_ref ?: strtoupper(substr($payment->id, 0, 12)) }}</td>
                    </tr>
                    <tr>
                        <td class="meta-label">Billed To:</td>
                        <td class="meta-value">
                            {{ $user ? ($user->first_name ? $user->first_name.' '.$user->last_name : $user->name) : 'Valued Customer' }}
                            @if($user && $user->email)
                                <div style="font-weight: normal; font-size: 11px; color: #64748b;">{{ $user->email }}</div>
                            @endif
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <!-- Items -->
    <table class="items-table" cellpadding="0" cellspacing="0">
        <thead>
            <tr>
                <th style="width: 50%;">Item &amp; Description</th>
                <th class="text-center" style="width: 15%;">Qty</th>
                <th class="text-right" style="width: 15%;">Virtual Coins</th>
                <th class="text-right" style="width: 20%;">Total</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>
                    <div class="item-title">
                        {{ $payment->package ? ucfirst($payment->package).' Coins Package' : 'Custom Coins Top-up' }}
                    </div>
                    <div class="item-desc">
                        Virtual Coins for social gaming entertainment
                        @if($payment->bonus_coins > 0)
                            &middot; Includes {{ number_format($payment->bonus_coins / 100) }} bonus coins
                        @endif
                    </div>
                </td>
                <td class="text-center">1</td>
                <td class="text-right">
                    <strong>+{{ number_format($payment->totalCoins() / 100) }}</strong>
                </td>
                <td class="text-right">
                    <strong>{{ $payment->symbol() }}{{ number_format($payment->amount / 100, 2) }}</strong>
                </td>
            </tr>
        </tbody>
    </table>

    <!-- Totals -->
    <table class="summary-table" cellpadding="0" cellspacing="0">
        <tr>
            <td style="width: 50%; padding-right: 20px;">
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px;">
                    <div class="section-label" style="margin-bottom: 4px;">Account Credited</div>
                    <div style="font-size: 13px; font-weight: 700; color: #0f172a;">
                        +{{ number_format($payment->totalCoins() / 100) }} Coins added to player wallet
                    </div>
                    <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
                        Currency: {{ $payment->currency }} &middot; Status: Complete
                    </div>
                </div>
            </td>
            <td style="width: 50%;">
                <table class="totals-box" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="color: #64748b;">Subtotal:</td>
                        <td class="text-right" style="font-weight: 600;">{{ $payment->symbol() }}{{ number_format($payment->amount / 100, 2) }}</td>
                    </tr>
                    <tr>
                        <td style="color: #64748b;">Tax / VAT (0%):</td>
                        <td class="text-right" style="font-weight: 600;">{{ $payment->symbol() }}0.00</td>
                    </tr>
                    <tr class="total-row">
                        <td>Amount Paid:</td>
                        <td class="text-right">{{ $payment->symbol() }}{{ number_format($payment->amount / 100, 2) }}</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <!-- Footer -->
    <div class="footer">
        Coins are a virtual currency for social gaming and entertainment purposes only. They carry no real-world monetary value and cannot be redeemed or withdrawn for cash.<br>
        Thank you for playing at {{ $appName }}! If you have any questions regarding this invoice, please contact {{ $company['email'] ?? 'support@acegg.co.uk' }}.
    </div>
</body>
</html>
