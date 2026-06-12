@php
    $name = $user->fullName ?? $user->name ?? 'Quy khach';
    $content = $setting->birthday_content ?? '';
    $content = str_replace(['[Ten_Khach_Hang]', '[Tên_Khách_Hàng]', '[TÃªn_KhÃ¡ch_HÃ ng]'], $name, $content);
@endphp

<h2>Chuc mung sinh nhat, {{ $name }}!</h2>
<div>{!! nl2br(e($content)) !!}</div>
