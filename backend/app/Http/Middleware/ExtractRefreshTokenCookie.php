<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ExtractRefreshTokenCookie
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $cookieName = 'refresh_token'): Response
    {
        if ($request->hasCookie($cookieName)) {
            $request->headers->set('Authorization', 'Bearer ' . $request->cookie($cookieName));
        }
        
        return $next($request);
    }
}
