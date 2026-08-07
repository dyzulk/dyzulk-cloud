<?php

$_SERVER['SERVER_PORT'] = 8001;

use App\Models\Employee;

test('finance page requires authentication', function () {
    $response = $this->get(route('office.finance.index'));

    $response->assertRedirect(route('office.login'));
});

test('administrator employee can access the finance page', function () {
    $employee = Employee::factory()->create([
        'role' => 'administrator',
    ]);

    $response = $this->actingAs($employee, 'office')
        ->get(route('office.finance.index'));

    $response->assertStatus(200);
});

test('finance department employee can access the finance page', function () {
    $employee = Employee::factory()->create([
        'department' => 'finance',
        'role' => 'staff',
    ]);

    $response = $this->actingAs($employee, 'office')
        ->get(route('office.finance.index'));

    $response->assertStatus(200);
});

test('non-finance department employee cannot access the finance page', function () {
    $employee = Employee::factory()->create([
        'department' => 'marketing',
        'role' => 'staff',
    ]);

    $response = $this->actingAs($employee, 'office')
        ->get(route('office.finance.index'));

    $response->assertStatus(403);
});
