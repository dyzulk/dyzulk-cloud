<?php

namespace App\Http\Controllers\Office\Auth;

use App\Enums\OfficeDepartment;
use App\Enums\OfficeRole;
use App\Http\Controllers\Controller;
use App\Models\Employee;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class OnboardingController extends Controller
{
    /**
     * Display the initial onboarding setup view.
     */
    public function create(): Response|RedirectResponse
    {
        if (Employee::count() > 0) {
            return redirect()->route('office.login');
        }

        return Inertia::render('office/auth/onboarding');
    }

    /**
     * Handle initial onboarding administrator creation.
     */
    public function store(Request $request): RedirectResponse
    {
        if (Employee::count() > 0) {
            return redirect()->route('office.login');
        }

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:employees,email'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $employee = Employee::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'employee_id' => 'EMP-0001',
            'department' => OfficeDepartment::Administration,
            'role' => OfficeRole::Administrator,
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        Auth::guard('office')->login($employee);

        $request->session()->regenerate();

        return redirect()->route('office.dashboard');
    }
}
