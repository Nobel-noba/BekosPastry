<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserRole
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (! $request->user()) {
            return redirect()->route('login');
        }

        $userRole = $request->user()->role;

        if (! in_array($userRole, $roles)) {
            // Redirect user to their own role dashboard if trying to access another panel
            return match ($userRole) {
                'admin' => redirect()->route('admin.dashboard'),
                'chef' => redirect()->route('chef.dashboard'),
                'sales' => redirect()->route('sales.dashboard'),
                default => abort(403, 'Unauthorized access.'),
            };
        }

        return $next($request);
    }
}
