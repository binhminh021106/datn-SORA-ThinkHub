<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class Cors
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        $response->header('Access-Control-Allow-Origin', '*')
                 ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
                 ->header('Access-Control-Allow-Headers', 'Origin, Content-Type, Authorization, X-Auth-Token, X-Requested-With')
                 ->header('Access-Control-Expose-Headers', 'Content-Length, X-JSON-Response')
                 ->header('Access-Control-Max-Age', '86400');

        // Handle preflight request
        if ($request->isMethod('options')) {
            return response()->json('{"method":"OPTIONS"}', 200, [
                'Access-Control-Allow-Origin' => '*',
                'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
                'Access-Control-Allow-Headers' => 'Origin, Content-Type, Authorization, X-Auth-Token, X-Requested-With',
            ]);
        }

        return $response;
    }
}
