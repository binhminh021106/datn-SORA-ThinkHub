@php
    $name = $user->fullName ?? $user->name ?? 'Quy khach';
    $content = $event->email_content ?? '';
    $voucherCode = $event->voucher_code ?? ($event->code ?? null);
    $content = str_replace(
        ['[Ten_Khach_Hang]', '[Tên_Khách_Hàng]', '[TÃªn_KhÃ¡ch_HÃ ng]', '[Voucher_Code]'],
        [$name, $name, $name, $voucherCode],
        $content
    );
@endphp

<h2>{{ $event->name ?? $holidayName }}</h2>
<p>Xin chao {{ $name }},</p>
<div>{!! nl2br(e($content)) !!}</div>

@if ($voucherCode)
    <p><strong>Ma uu dai:</strong> {{ $voucherCode }}</p>
@endif
