<?php

$_SERVER['SERVER_PORT'] = 8001;

use App\Models\Employee;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// ── office:delete-employee-all ──────────────────────────────────────

test('delete-employee-all shows warning when no employees exist', function () {
    $this->artisan('office:delete-employee-all')
        ->assertSuccessful();

    expect(Employee::count())->toBe(0);
});

test('delete-employee-all deletes all employees when confirmed', function () {
    Employee::factory()->count(3)->create();

    expect(Employee::count())->toBe(3);

    $this->artisan('office:delete-employee-all')
        ->expectsConfirmation('Are you sure you want to delete ALL 3 employee(s)?', 'Yes')
        ->assertSuccessful();

    expect(Employee::count())->toBe(0);
});

test('delete-employee-all does not delete when cancelled', function () {
    Employee::factory()->count(2)->create();

    $this->artisan('office:delete-employee-all')
        ->expectsConfirmation('Are you sure you want to delete ALL 2 employee(s)?', 'No')
        ->assertSuccessful();

    expect(Employee::count())->toBe(2);
});

// ── office:delete-employee ──────────────────────────────────────────

test('delete-employee shows warning when no employees exist', function () {
    $this->artisan('office:delete-employee')
        ->assertSuccessful();

    expect(Employee::count())->toBe(0);
});

test('delete-employee deletes selected employees when confirmed', function () {
    $employees = Employee::factory()->count(3)->create();
    $toDelete = $employees->take(2);

    expect(Employee::count())->toBe(3);

    $this->artisan('office:delete-employee')
        ->expectsChoice(
            'Select employees to delete',
            $toDelete->pluck('id')->map(fn ($id) => (string) $id)->toArray(),
            $employees->mapWithKeys(fn (Employee $employee) => [
                (string) $employee->id => "[{$employee->employee_id}] {$employee->name} ({$employee->email})",
            ])->toArray(),
        )
        ->expectsConfirmation('Are you sure you want to delete 2 employee(s)?', 'Yes')
        ->assertSuccessful();

    expect(Employee::count())->toBe(1);
    expect(Employee::first()->id)->toBe($employees->last()->id);
});

test('delete-employee does not delete when cancelled', function () {
    $employees = Employee::factory()->count(2)->create();

    $this->artisan('office:delete-employee')
        ->expectsChoice(
            'Select employees to delete',
            [(string) $employees->first()->id],
            $employees->mapWithKeys(fn (Employee $employee) => [
                (string) $employee->id => "[{$employee->employee_id}] {$employee->name} ({$employee->email})",
            ])->toArray(),
        )
        ->expectsConfirmation('Are you sure you want to delete 1 employee(s)?', 'No')
        ->assertSuccessful();

    expect(Employee::count())->toBe(2);
});
