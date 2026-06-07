<?php

namespace App\Models;

use App\Enums\OfficeDepartment;
use App\Enums\OfficeRole;
use Database\Factories\EmployeeFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password', 'employee_id', 'department', 'role', 'is_active'])]
#[Hidden(['password', 'remember_token'])]
class Employee extends Authenticatable
{
    /** @use HasFactory<EmployeeFactory> */
    use HasFactory, Notifiable;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'employees';

    /**
     * Determine if the employee is an administrator.
     */
    public function isAdministrator(): bool
    {
        return $this->role === OfficeRole::Administrator;
    }

    /**
     * Determine if the employee is at least the given role.
     */
    public function isAtLeast(OfficeRole $role): bool
    {
        return $this->role->isAtLeast($role);
    }

    /**
     * Determine if the employee belongs to the given department.
     */
    public function inDepartment(OfficeDepartment $department): bool
    {
        return $this->department === $department;
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'department' => OfficeDepartment::class,
            'role' => OfficeRole::class,
            'is_active' => 'boolean',
        ];
    }
}
