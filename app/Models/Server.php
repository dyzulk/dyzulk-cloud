<?php

namespace App\Models;

use Database\Factories\ServerFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Server extends Model
{
    /** @use HasFactory<ServerFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'uuid',
        'name',
        'description',
        'host',
        'port',
        'username',
        'type', // 'local', 'build', 'node', 'deploy'
        'ssh_key_id',
        'swarm_manager_server_id',
        'known_host',
        'host_key_fingerprint',
        'host_key_status', // 'pending', 'verified', 'failed'
        'connection_status', // 'unknown', 'online', 'offline'
        'setup_status', // 'not_started', 'in_progress', 'completed', 'failed'
        'validated_at',
        'telemetry_collected_at',
        'validation_result',
        'telemetry',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'port' => 'integer',
            'validated_at' => 'datetime',
            'telemetry_collected_at' => 'datetime',
            'validation_result' => 'array',
            'telemetry' => 'array',
        ];
    }

    /**
     * Bootstrap the model and its traits.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (Server $server) {
            if (empty($server->uuid)) {
                $server->uuid = (string) Str::uuid();
            }
        });
    }

    /**
     * Get the SSH key associated with the server.
     */
    public function sshKey(): BelongsTo
    {
        return $this->belongsTo(SshKey::class);
    }

    /**
     * Get the Swarm Manager server (if this is a worker node).
     */
    public function swarmManager(): BelongsTo
    {
        return $this->belongsTo(Server::class, 'swarm_manager_server_id');
    }

    /**
     * Get the worker nodes associated with this manager server.
     */
    public function swarmWorkers(): HasMany
    {
        return $this->hasMany(Server::class, 'swarm_manager_server_id');
    }
}
