<?php

$_SERVER['SERVER_PORT'] = 8001;

use App\Models\Employee;

test('reports page requires authentication', function () {
    $response = $this->get(route('office.reports.index'));

    $response->assertRedirect(route('office.login'));
});

test('administrator employee can access the reports page', function () {
    $employee = Employee::factory()->create([
        'role' => 'administrator',
    ]);

    $response = $this->actingAs($employee, 'office')
        ->get(route('office.reports.index'));

    $response->assertStatus(200);
});

test('non-administrator employee cannot access the reports page', function () {
    $employee = Employee::factory()->create([
        'role' => 'staff',
    ]);

    $response = $this->actingAs($employee, 'office')
        ->get(route('office.reports.index'));

    $response->assertStatus(403);
});
