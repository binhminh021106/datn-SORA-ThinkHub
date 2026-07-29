<?php

namespace App\Http\Middleware;

use App\Models\Admin;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminUser
{
    /**
     * Prevent a customer Sanctum token from entering the admin route tree.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user('sanctum') instanceof Admin) {
            return response()->json([
                'success' => false,
                'message' => 'Phiên đăng nhập quản trị không hợp lệ.',
            ], 403);
        }

        return $next($request);
    }
}
