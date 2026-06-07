<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class CaCertificate extends Model
{
    use HasFactory;

    protected $primaryKey = 'uuid';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'uuid',
        'ca_type',
        'key_algorithm',
        'curve_name',
        'cert_content',
        'key_content',
        'serial_number',
        'common_name',
        'organization',
        'issuer_name',
        'issuer_serial',
        'family_id',
        'valid_from',
        'valid_to',
        'is_latest',
        'cert_path',
        'der_path',
        'bat_path',
        'mac_path',
        'linux_path',
        'last_synced_at',
        'download_count',
        'last_downloaded_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'valid_from' => 'datetime',
            'valid_to' => 'datetime',
            'is_latest' => 'boolean',
            'last_synced_at' => 'datetime',
            'last_downloaded_at' => 'datetime',
            'download_count' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (CaCertificate $model): void {
            if (empty($model->uuid)) {
                $model->uuid = (string) Str::uuid();
            }
        });
    }
}
