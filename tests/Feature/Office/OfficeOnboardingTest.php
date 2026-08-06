<?php

use App\Enums\OfficeDepartment;
use App\Enums\OfficeRole;
use App\Models\Employee;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('office login redirects to onboarding when no employees exist', function () {
    expect(Employee::count())->toBe(0);

    $response = $this->get(route('office.login'));

    $response->assertRedirect(route('office.onboarding'));
});

test('office onboarding screen can be rendered when no employees exist', function () {
    expect(Employee::count())->toBe(0);

    $response = $this->get(route('office.onboarding'));

    $response->assertStatus(200);
});

test('office onboarding screen redirects to login when employees already exist', function () {
    Employee::factory()->create();

    $response = $this->get(route('office.onboarding'));

    $response->assertRedirect(route('office.login'));
});

test('first user can be created via web onboarding as administrator', function () {
    expect(Employee::count())->toBe(0);

    $response = $this->post(route('office.onboarding.store'), [
        'name' => 'Initial Admin',
        'email' => 'admin@office.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    expect(Employee::count())->toBe(1);

    $admin = Employee::first();
    expect($admin->name)->toBe('Initial Admin')
        ->and($admin->email)->toBe('admin@office.com')
        ->and($admin->role)->toBe(OfficeRole::Administrator)
        ->and($admin->department)->toBe(OfficeDepartment::Administration)
        ->and($admin->is_active)->toBeTrue();

    $this->assertAuthenticatedAs($admin, 'office');
    $response->assertRedirect(route('office.dashboard'));
});

test('onboarding store redirects to login if employees already exist', function () {
    Employee::factory()->create();

    $response = $this->post(route('office.onboarding.store'), [
        'name' => 'Another User',
        'email' => 'another@office.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertRedirect(route('office.login'));
});

test('artisan office:create-user command can create an employee', function () {
    $this->artisan('office:create-user', [
        '--name' => 'CLI Admin',
        '--email' => 'cli-admin@office.com',
        '--password' => 'password123',
    ])->assertSuccessful();

    expect(Employee::count())->toBe(1);

    $employee = Employee::first();
    expect($employee->name)->toBe('CLI Admin')
        ->and($employee->email)->toBe('cli-admin@office.com')
        ->and($employee->role)->toBe(OfficeRole::Administrator);
});
