<?php

namespace App\Http\Controllers\Office\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Office\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class LoginController extends Controller
{
    /**
     * Display the office login view.
     */
    public function create(): Response
    {
        return Inertia::render('office/auth/login');
    }

    /**
     * Handle an incoming office authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        return redirect()->intended(
            route('office.dashboard'),
        );
    }

    /**
     * Destroy an authenticated office session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('office')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('office.login');
    }
}
