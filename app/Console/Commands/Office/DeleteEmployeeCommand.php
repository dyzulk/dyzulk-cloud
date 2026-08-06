<?php

namespace App\Console\Commands\Office;

use App\Models\Employee;
use Illuminate\Console\Command;

use function Laravel\Prompts\confirm;
use function Laravel\Prompts\info;
use function Laravel\Prompts\multiselect;
use function Laravel\Prompts\table;
use function Laravel\Prompts\warning;

class DeleteEmployeeCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'office:delete-employee';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Interactively select and delete employee accounts';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $employees = Employee::all();

        if ($employees->isEmpty()) {
            warning('No employees found in the database.');

            return self::SUCCESS;
        }

        info("Found {$employees->count()} employee(s) in the database:");

        table(
            headers: ['Employee ID', 'Name', 'Email', 'Role', 'Department'],
            rows: $employees->map(fn (Employee $employee) => [
                $employee->employee_id,
                $employee->name,
                $employee->email,
                $employee->role->label(),
                $employee->department->label(),
            ])->toArray()
        );

        /** @var array<int> $selectedIds */
        $selectedIds = multiselect(
            label: 'Select employees to delete',
            options: $employees->mapWithKeys(fn (Employee $employee) => [
                $employee->id => "[{$employee->employee_id}] {$employee->name} ({$employee->email})",
            ])->toArray(),
            required: 'You must select at least one employee.',
            hint: '[space] toggle selection  [a] select all  [x] deselect all  [enter] confirm',
        );

        $selectedEmployees = Employee::whereIn('id', $selectedIds)->get();

        info('You selected the following employee(s) for deletion:');

        table(
            headers: ['Employee ID', 'Name', 'Email', 'Role', 'Department'],
            rows: $selectedEmployees->map(fn (Employee $employee) => [
                $employee->employee_id,
                $employee->name,
                $employee->email,
                $employee->role->label(),
                $employee->department->label(),
            ])->toArray()
        );

        $confirmed = confirm(
            label: "Are you sure you want to delete {$selectedEmployees->count()} employee(s)?",
            default: false,
            hint: 'This action cannot be undone.',
        );

        if (! $confirmed) {
            info('Operation cancelled. No employees were deleted.');

            return self::SUCCESS;
        }

        $deleted = Employee::whereIn('id', $selectedIds)->delete();

        info("Successfully deleted {$deleted} employee(s).");

        return self::SUCCESS;
    }
}
