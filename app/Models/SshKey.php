<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class SshKey extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'uuid',
        'team_id',
        'name',
        'description',
        'type',
        'private_key',
        'public_key',
        'fingerprint',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'private_key',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'private_key' => 'encrypted',
        ];
    }

    /**
     * Bootstrap the model and its traits.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (SshKey $sshKey) {
            if (empty($sshKey->uuid)) {
                $sshKey->uuid = (string) Str::uuid();
            }
        });
    }

    /**
     * Get the team that owns the SSH key.
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }
}
