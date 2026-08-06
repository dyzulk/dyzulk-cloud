<?php

namespace App\Console\Commands\Office;

use App\Models\Employee;
use Illuminate\Console\Command;

use function Laravel\Prompts\confirm;
use function Laravel\Prompts\info;
use function Laravel\Prompts\table;
use function Laravel\Prompts\warning;

class DeleteAllEmployeesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'office:delete-employee-all';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Delete all employee accounts from the database';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $count = Employee::count();

        if ($count === 0) {
            warning('No employees found in the database.');

            return self::SUCCESS;
        }

        $employees = Employee::all();

        info("Found {$count} employee(s) in the database:");

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

        $confirmed = confirm(
            label: "Are you sure you want to delete ALL {$count} employee(s)?",
            default: false,
            hint: 'This action cannot be undone.',
        );

        if (! $confirmed) {
            info('Operation cancelled. No employees were deleted.');

            return self::SUCCESS;
        }

        $deleted = Employee::query()->delete();

        info("Successfully deleted {$deleted} employee(s).");

        return self::SUCCESS;
    }
}
