<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class CartMutationLock
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user('sanctum');
        $sessionId = trim((string) $request->header('X-Cart-Session-Id', ''));

        // Guest cart identifiers are bearer-like identifiers. Restrict their
        // shape and length before they are used as a database/cache key.
        if (!$user && $sessionId !== '' && !preg_match('/^[A-Za-z0-9_-]{16,128}$/', $sessionId)) {
            return response()->json([
                'success' => false,
                'message' => 'Phiên giỏ hàng không hợp lệ. Vui lòng tải lại trang và thử lại.',
            ], 422);
        }

        $ownerKey = $user ? 'user:' . $user->id : 'session:' . ($sessionId ?: 'ip:' . $request->ip());
        // Leave enough time for a transaction that validates stock/combo data
        // without allowing a second mutation to overlap after a slow query.
        $lock = Cache::lock('cart_mutation:' . hash('sha256', $ownerKey), 30);

        if (!$lock->get()) {
            return response()->json([
                'success' => false,
                'message' => 'Giỏ hàng đang được cập nhật, vui lòng thử lại sau.',
            ], 429);
        }

        try {
            return $next($request);
        } finally {
            $lock->release();
        }
    }
}
