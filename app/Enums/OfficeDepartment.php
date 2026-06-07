<?php

namespace App\Enums;

enum OfficeDepartment: string
{
    case Administration = 'administration';
    case Finance = 'finance';
    case Marketing = 'marketing';
    case Planning = 'planning';

    /**
     * Get the display label for the department.
     */
    public function label(): string
    {
        return match ($this) {
            self::Administration => 'Administration',
            self::Finance => 'Finance',
            self::Marketing => 'Marketing',
            self::Planning => 'Planning',
        };
    }

    /**
     * Get all departments as options for forms.
     *
     * @return array<array{value: string, label: string}>
     */
    public static function options(): array
    {
        return collect(self::cases())
            ->map(fn (self $department) => ['value' => $department->value, 'label' => $department->label()])
            ->values()
            ->toArray();
    }
}
