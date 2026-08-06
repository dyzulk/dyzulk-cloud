<?php

use App\Models\Employee;

test('docker management page requires authentication', function () {
    $response = $this->get(route('office.docker.index'));

    $response->assertRedirect(route('office.login'));
});

test('administrator employee can access the docker management page', function () {
    $employee = Employee::factory()->create([
        'role' => 'administrator',
    ]);

    $response = $this->actingAs($employee, 'office')
        ->get(route('office.docker.index'));

    $response->assertStatus(200);
});

test('non-administrator employee cannot access the docker management page', function () {
    $employee = Employee::factory()->create([
        'role' => 'staff',
    ]);

    $response = $this->actingAs($employee, 'office')
        ->get(route('office.docker.index'));

    $response->assertStatus(403);
});
