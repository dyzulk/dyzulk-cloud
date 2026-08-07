<?php

$_SERVER['SERVER_PORT'] = 8001;

use App\Models\Employee;

test('marketing page requires authentication', function () {
    $response = $this->get(route('office.marketing.index'));

    $response->assertRedirect(route('office.login'));
});

test('administrator employee can access the marketing page', function () {
    $employee = Employee::factory()->create([
        'role' => 'administrator',
    ]);

    $response = $this->actingAs($employee, 'office')
        ->get(route('office.marketing.index'));

    $response->assertStatus(200);
});

test('marketing department employee can access the marketing page', function () {
    $employee = Employee::factory()->create([
        'department' => 'marketing',
        'role' => 'staff',
    ]);

    $response = $this->actingAs($employee, 'office')
        ->get(route('office.marketing.index'));

    $response->assertStatus(200);
});

test('non-marketing department employee cannot access the marketing page', function () {
    $employee = Employee::factory()->create([
        'department' => 'finance',
        'role' => 'staff',
    ]);

    $response = $this->actingAs($employee, 'office')
        ->get(route('office.marketing.index'));

    $response->assertStatus(403);
});
