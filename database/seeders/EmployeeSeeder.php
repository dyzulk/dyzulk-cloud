<?php

namespace Database\Seeders;

use App\Models\Employee;
use Illuminate\Database\Seeder;

class EmployeeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (! Employee::where('employee_id', 'EMP-0001')->exists()) {
            Employee::factory()->administrator()->create([
                'name' => 'Office Admin',
                'email' => 'admin@office.example.com',
                'employee_id' => 'EMP-0001',
            ]);
        }

        if (! Employee::where('employee_id', 'EMP-0002')->exists()) {
            Employee::factory()->manager()->finance()->create([
                'name' => 'Finance Manager',
                'email' => 'finance@office.example.com',
                'employee_id' => 'EMP-0002',
            ]);
        }

        if (! Employee::where('employee_id', 'EMP-0003')->exists()) {
            Employee::factory()->manager()->marketing()->create([
                'name' => 'Marketing Manager',
                'email' => 'marketing@office.example.com',
                'employee_id' => 'EMP-0003',
            ]);
        }

        if (! Employee::where('employee_id', 'EMP-0004')->exists()) {
            Employee::factory()->manager()->planning()->create([
                'name' => 'Planning Manager',
                'email' => 'planning@office.example.com',
                'employee_id' => 'EMP-0004',
            ]);
        }

        if (Employee::count() < 10) {
            Employee::factory()->count(3)->finance()->create();
            Employee::factory()->count(3)->marketing()->create();
            Employee::factory()->count(3)->planning()->create();
        }
    }
}
