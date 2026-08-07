<?php

$_SERVER['SERVER_PORT'] = 8001;

use App\Models\Employee;

test('planning page requires authentication', function () {
    $response = $this->get(route('office.planning.index'));

    $response->assertRedirect(route('office.login'));
});

test('administrator employee can access the planning page', function () {
    $employee = Employee::factory()->create([
        'role' => 'administrator',
    ]);

    $response = $this->actingAs($employee, 'office')
        ->get(route('office.planning.index'));

    $response->assertStatus(200);
});

test('planning department employee can access the planning page', function () {
    $employee = Employee::factory()->create([
        'department' => 'planning',
        'role' => 'staff',
    ]);

    $response = $this->actingAs($employee, 'office')
        ->get(route('office.planning.index'));

    $response->assertStatus(200);
});

test('non-planning department employee cannot access the planning page', function () {
    $employee = Employee::factory()->create([
        'department' => 'finance',
        'role' => 'staff',
    ]);

    $response = $this->actingAs($employee, 'office')
        ->get(route('office.planning.index'));

    $response->assertStatus(403);
});
