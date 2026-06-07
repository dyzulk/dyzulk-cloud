<?php

use App\Models\Employee;

test('office login screen can be rendered', function () {
    $response = $this->get(route('office.login'));

    $response->assertStatus(200);
});

test('employees can authenticate via the office login', function () {
    $employee = Employee::factory()->create();

    $response = $this->post(route('office.login'), [
        'email' => $employee->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticatedAs($employee, 'office');
    $response->assertRedirect(route('office.dashboard'));
});

test('employees cannot authenticate with invalid password', function () {
    $employee = Employee::factory()->create();

    $this->post(route('office.login'), [
        'email' => $employee->email,
        'password' => 'wrong-password',
    ]);

    $this->assertGuest('office');
});

test('inactive employees cannot authenticate', function () {
    $employee = Employee::factory()->inactive()->create();

    $this->post(route('office.login'), [
        'email' => $employee->email,
        'password' => 'password',
    ]);

    $this->assertGuest('office');
});

test('employees can logout', function () {
    $employee = Employee::factory()->create();

    $response = $this->actingAs($employee, 'office')
        ->post(route('office.logout'));

    $this->assertGuest('office');
    $response->assertRedirect(route('office.login'));
});

test('office dashboard requires authentication', function () {
    $response = $this->get(route('office.dashboard'));

    $response->assertRedirect(route('office.login'));
});

test('authenticated employees can access the office dashboard', function () {
    $employee = Employee::factory()->create();

    $response = $this->actingAs($employee, 'office')
        ->get(route('office.dashboard'));

    $response->assertStatus(200);
});

test('inactive employees cannot access the office dashboard', function () {
    $employee = Employee::factory()->inactive()->create();

    $response = $this->actingAs($employee, 'office')
        ->get(route('office.dashboard'));

    $response->assertStatus(403);
});

test('public users cannot access the office dashboard', function () {
    $user = \App\Models\User::factory()->create();

    $response = $this->actingAs($user, 'web')
        ->get(route('office.dashboard'));

    $response->assertRedirect(route('office.login'));
});

test('office guard is isolated from web guard', function () {
    $employee = Employee::factory()->create();

    $this->actingAs($employee, 'office');

    $this->assertAuthenticatedAs($employee, 'office');
    $this->assertGuest('web');
});
