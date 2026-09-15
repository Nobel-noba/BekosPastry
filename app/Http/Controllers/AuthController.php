<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    /**
     * Show the login view.
     */
    public function showLogin(): Response|RedirectResponse
    {
        if (Auth::check()) {
            return $this->redirectByRole(Auth::user());
        }

        return Inertia::render('Auth/Login');
    }

    /**
     * Authenticate user credentials.
     */
    public function login(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();

            /** @var User $user */
            $user = Auth::user();

            if ($user->status !== 'active') {
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                return back()->withErrors([
                    'email' => 'Your account is deactivated. Please contact the administrator.',
                ]);
            }

            return $this->redirectByRole($user);
        }

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ])->onlyInput('email');
    }

    /**
     * Fast 1-click login for test and demo evaluation.
     */
    public function quickLogin(string $role): RedirectResponse
    {
        $email = match ($role) {
            'admin' => 'admin@beki.com',
            'chef' => 'chef@beki.com',
            'sales' => 'sales@beki.com',
            default => null,
        };

        if (! $email) {
            return redirect()->route('login');
        }

        $user = User::where('email', $email)->first();
        if ($user) {
            Auth::login($user);
            request()->session()->regenerate();

            return $this->redirectByRole($user);
        }

        return redirect()->route('login')->with('error', 'Demo user not found.');
    }

    /**
     * Log the user out of the application.
     */
    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }

    /**
     * Helper to redirect authenticated user to their role dashboard.
     */
    private function redirectByRole(User $user): RedirectResponse
    {
        return match ($user->role) {
            'admin' => redirect()->route('admin.dashboard'),
            'chef' => redirect()->route('chef.dashboard'),
            'sales' => redirect()->route('sales.dashboard'),
            default => redirect()->route('login'),
        };
    }
}
