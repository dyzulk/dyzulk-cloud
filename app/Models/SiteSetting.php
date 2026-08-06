<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteSetting extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'key',
        'group',
        'value',
        'type',
    ];

    /**
     * Get a setting value by key.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        $setting = static::where('key', $key)->first();

        if (! $setting) {
            return $default;
        }

        return match ($setting->type) {
            'boolean' => filter_var($setting->value, FILTER_VALIDATE_BOOLEAN),
            'integer' => (int) $setting->value,
            'json' => json_decode($setting->value ?? '[]', true),
            default => $setting->value ?? $default,
        };
    }

    /**
     * Set a setting value by key.
     */
    public static function set(string $key, mixed $value, string $group = 'general', string $type = 'string'): self
    {
        $serializedValue = match ($type) {
            'boolean' => $value ? '1' : '0',
            'json' => is_string($value) ? $value : json_encode($value),
            default => (string) ($value ?? ''),
        };

        return static::updateOrCreate(
            ['key' => $key],
            [
                'group' => $group,
                'value' => $serializedValue,
                'type' => $type,
            ]
        );
    }

    /**
     * Get all settings in a specific group as a key-value associative array.
     *
     * @return array<string, mixed>
     */
    public static function getGroup(string $group): array
    {
        return static::where('group', $group)
            ->get()
            ->mapWithKeys(function (self $setting) {
                $val = match ($setting->type) {
                    'boolean' => filter_var($setting->value, FILTER_VALIDATE_BOOLEAN),
                    'integer' => (int) $setting->value,
                    'json' => json_decode($setting->value ?? '[]', true),
                    default => $setting->value ?? '',
                };

                return [$setting->key => $val];
            })
            ->toArray();
    }

    /**
     * Bulk set key-value array in a specific group.
     *
     * @param  array<string, mixed>  $values
     * @param  array<string, string>  $types
     */
    public static function setGroup(string $group, array $values, array $types = []): void
    {
        foreach ($values as $key => $val) {
            $type = $types[$key] ?? (is_bool($val) ? 'boolean' : (is_array($val) ? 'json' : 'string'));
            static::set($key, $val, $group, $type);
        }
    }
}
