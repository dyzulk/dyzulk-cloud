<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Str;

class Certificate extends Model
{
    use HasFactory;

    protected $primaryKey = 'uuid';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'uuid',
        'team_id',
        'common_name',
        'organization',
        'locality',
        'state',
        'country',
        'san',
        'key_bits',
        'key_algorithm',
        'curve_name',
        'serial_number',
        'cert_content',
        'key_content',
        'csr_content',
        'valid_from',
        'valid_to',
        'expired_notification_sent_at',
    ];

    protected $hidden = [
        'key_content',
        'expired_notification_sent_at',
    ];

    protected $appends = [
        'ssl_status',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'valid_from' => 'datetime',
            'valid_to' => 'datetime',
            'expired_notification_sent_at' => 'datetime',
            'key_bits' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Certificate $model): void {
            if (empty($model->uuid)) {
                $model->uuid = (string) Str::uuid();
            }
        });
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    /**
     * Encrypt the private key before storing.
     */
    public function setKeyContentAttribute(string $value): void
    {
        $this->attributes['key_content'] = Crypt::encryptString($value);
    }

    /**
     * Decrypt the private key when reading.
     */
    public function getKeyContentAttribute(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        try {
            return Crypt::decryptString($value);
        } catch (\Illuminate\Contracts\Encryption\DecryptException) {
            return $value;
        }
    }

    /**
     * Get the SSL status based on validity.
     */
    public function getSslStatusAttribute(): string
    {
        if ($this->valid_to && $this->valid_to->isPast()) {
            return 'EXPIRED';
        }

        return 'ACTIVE';
    }
}
