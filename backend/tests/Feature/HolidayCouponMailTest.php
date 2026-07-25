<?php

namespace Tests\Feature;

use PHPUnit\Framework\TestCase;
use App\Mail\HolidayCouponMail;

class HolidayCouponMailTest extends TestCase
{
    public function test_voucher_code_is_escaped()
    {
        $reflection = new \ReflectionClass(HolidayCouponMail::class);
        $mail = $reflection->newInstanceWithoutConstructor();

        // Set properties needed for prepareEmailContent
        $user = new \stdClass();
        $user->name = 'Test User';
        $reflectionPropertyUser = $reflection->getProperty('user');
        $reflectionPropertyUser->setValue($mail, $user);

        $reflectionPropertyVoucher = $reflection->getProperty('voucherCode');
        // Malicious voucher code
        $maliciousCode = '<script>alert("xss")</script> & " \'';
        $reflectionPropertyVoucher->setValue($mail, $maliciousCode);

        $method = $reflection->getMethod('prepareEmailContent');
        $method->setAccessible(true);

        $content = 'Here is your code: [Voucher_Code]';
        $result = $method->invoke($mail, $content);

        $this->assertStringContainsString(
            htmlspecialchars($maliciousCode, ENT_QUOTES, 'UTF-8'),
            $result
        );
        
        $this->assertStringNotContainsString('<script>', $result);
    }
}
