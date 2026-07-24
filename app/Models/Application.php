<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

#[Fillable([
    'uuid',
    'team_id',
    'git_connection_id',
    'name',
    'display_name',
    'environment',
    'region',
    'git_repository_id',
    'repository_name',
    'branch',
    'compute_size',
    'status',
    'port',
])]
class Application extends Model
{
    use HasFactory;

    /**
     * Bootstrap the model and its traits.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (Application $application) {
            if (empty($application->uuid)) {
                $application->uuid = (string) Str::uuid();
            }
        });
    }

    /**
     * Get the team that owns the application.
     *
     * @return BelongsTo<Team, $this>
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    /**
     * Get the Git connection that authorizes this application.
     *
     * @return BelongsTo<GitConnection, $this>
     */
    public function gitConnection(): BelongsTo
    {
        return $this->belongsTo(GitConnection::class);
    }

    /**
     * Get the deployments for the application.
     *
     * @return HasMany<Deployment, $this>
     */
    public function deployments(): HasMany
    {
        return $this->hasMany(Deployment::class);
    }

    /**
     * Get the environment variables for the application.
     *
     * @return HasMany<EnvironmentVariable, $this>
     */
    public function environmentVariables(): HasMany
    {
        return $this->hasMany(EnvironmentVariable::class);
    }

    /**
     * Get the custom domains for the application.
     *
     * @return HasMany<Domain, $this>
     */
    public function domains(): HasMany
    {
        return $this->hasMany(Domain::class);
    }

    /**
     * Get the attached database/caching resources.
     *
     * @return BelongsToMany<ApplicationResource, $this>
     */
    public function applicationResources(): BelongsToMany
    {
        return $this->belongsToMany(
            ApplicationResource::class,
            'application_resource_pivot',
            'application_id',
            'application_resource_id'
        )->withTimestamps();
    }

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'name';
    }
}
