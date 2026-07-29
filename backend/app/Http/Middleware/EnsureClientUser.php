<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureClientUser
{
    /**
     * Sanctum tokens are issued to both Admin and User models. An ability name
     * alone is not an actor-type boundary, so client-only routes must also
     * verify the authenticatable model.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user('sanctum') instanceof User) {
            return response()->json([
                'success' => false,
                'message' => 'Phiên đăng nhập khách hàng không hợp lệ.',
            ], 403);
        }

        return $next($request);
    }
}
