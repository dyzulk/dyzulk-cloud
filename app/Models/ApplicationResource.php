<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Str;

#[Fillable([
    'uuid',
    'team_id',
    'name',
    'type',
    'connection_details',
    'status',
])]
class ApplicationResource extends Model
{
    /**
     * Bootstrap the model and its traits.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (ApplicationResource $resource) {
            if (empty($resource->uuid)) {
                $resource->uuid = (string) Str::uuid();
            }
        });
    }

    /**
     * Get the team that owns the resource.
     *
     * @return BelongsTo<Team, $this>
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    /**
     * Get the applications connected to this resource.
     *
     * @return BelongsToMany<Application, $this>
     */
    public function applications(): BelongsToMany
    {
        return $this->belongsToMany(
            Application::class,
            'application_resource_pivot',
            'application_resource_id',
            'application_id'
        )->withTimestamps();
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'connection_details' => 'encrypted:array',
        ];
    }
}
