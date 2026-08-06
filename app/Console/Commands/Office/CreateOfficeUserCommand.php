<?php

namespace App\Console\Commands\Office;

use App\Enums\OfficeDepartment;
use App\Enums\OfficeRole;
use App\Models\Employee;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

use function Laravel\Prompts\info;
use function Laravel\Prompts\password;
use function Laravel\Prompts\select;
use function Laravel\Prompts\table;
use function Laravel\Prompts\text;

class CreateOfficeUserCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'office:create-user
                            {--name= : The name of the employee}
                            {--email= : The email address of the employee}
                            {--password= : The password for the account}
                            {--role= : The role (staff, manager, administrator)}
                            {--department= : The department (administration, finance, marketing, planning)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a new Office employee account';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $isFirstUser = Employee::count() === 0;

        if ($isFirstUser) {
            info('No office users found. Creating the initial Administrator account...');
        }

        $name = $this->option('name') ?: text(
            label: 'Employee Name',
            placeholder: 'John Doe',
            required: true,
        );

        $email = $this->option('email') ?: text(
            label: 'Email Address',
            placeholder: 'employee@office.example.com',
            required: true,
            validate: function (string $value) {
                $validator = Validator::make(
                    ['email' => $value],
                    ['email' => ['required', 'email', 'unique:employees,email']]
                );

                return $validator->fails() ? $validator->errors()->first('email') : null;
            }
        );

        $passwordInput = $this->option('password') ?: password(
            label: 'Password',
            required: true,
            validate: function (string $value) {
                return strlen($value) < 8 ? 'The password must be at least 8 characters.' : null;
            }
        );

        if ($isFirstUser) {
            $roleValue = OfficeRole::Administrator->value;
            $departmentValue = OfficeDepartment::Administration->value;
            $this->info('Role and Department automatically assigned: Administrator (Administration)');
        } else {
            $roleValue = $this->option('role') ?: select(
                label: 'Role',
                options: array_combine(
                    array_column(OfficeRole::cases(), 'value'),
                    array_map(fn ($case) => $case->label(), OfficeRole::cases())
                ),
                default: OfficeRole::Staff->value
            );

            $departmentValue = $this->option('department') ?: select(
                label: 'Department',
                options: array_combine(
                    array_column(OfficeDepartment::cases(), 'value'),
                    array_map(fn ($case) => $case->label(), OfficeDepartment::cases())
                ),
                default: OfficeDepartment::Administration->value
            );
        }

        $role = OfficeRole::tryFrom($roleValue) ?? OfficeRole::Staff;
        $department = OfficeDepartment::tryFrom($departmentValue) ?? OfficeDepartment::Administration;

        // Generate unique Employee ID (e.g. EMP-0001 or EMP-xxxx)
        $employeeId = 'EMP-'.str_pad((string) (Employee::count() + 1), 4, '0', STR_PAD_LEFT);
        while (Employee::where('employee_id', $employeeId)->exists()) {
            $employeeId = 'EMP-'.str_pad((string) (rand(1000, 9999)), 4, '0', STR_PAD_LEFT);
        }

        $employee = Employee::create([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make($passwordInput),
            'employee_id' => $employeeId,
            'department' => $department,
            'role' => $role,
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        $this->components->info('Office employee created successfully!');

        table(
            headers: ['Employee ID', 'Name', 'Email', 'Role', 'Department'],
            rows: [
                [
                    $employee->employee_id,
                    $employee->name,
                    $employee->email,
                    $employee->role->label(),
                    $employee->department->label(),
                ],
            ]
        );

        return self::SUCCESS;
    }
}
