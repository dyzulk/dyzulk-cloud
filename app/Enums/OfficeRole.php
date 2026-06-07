<?php

namespace App\Enums;

enum OfficeRole: string
{
    case Administrator = 'administrator';
    case Manager = 'manager';
    case Staff = 'staff';

    /**
     * Get the display label for the role.
     */
    public function label(): string
    {
        return match ($this) {
            self::Administrator => 'Administrator',
            self::Manager => 'Manager',
            self::Staff => 'Staff',
        };
    }

    /**
     * Get the hierarchy level for this role.
     * Higher numbers indicate higher privileges.
     */
    public function level(): int
    {
        return match ($this) {
            self::Administrator => 3,
            self::Manager => 2,
            self::Staff => 1,
        };
    }

    /**
     * Check if this role is at least as privileged as another role.
     */
    public function isAtLeast(OfficeRole $role): bool
    {
        return $this->level() >= $role->level();
    }

    /**
     * Get the assignable roles for employee management.
     *
     * @return array<array{value: string, label: string}>
     */
    public static function assignable(): array
    {
        return collect(self::cases())
            ->map(fn (self $role) => ['value' => $role->value, 'label' => $role->label()])
            ->values()
            ->toArray();
    }
}
