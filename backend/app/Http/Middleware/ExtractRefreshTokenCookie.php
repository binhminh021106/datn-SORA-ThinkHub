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
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->hasCookie('refresh_token')) {
            $request->headers->set('Authorization', 'Bearer ' . $request->cookie('refresh_token'));
        } elseif ($request->hasCookie('admin_refresh_token')) {
            $request->headers->set('Authorization', 'Bearer ' . $request->cookie('admin_refresh_token'));
        }
        
        return $next($request);
    }
}
