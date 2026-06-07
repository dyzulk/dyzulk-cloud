<?php

namespace App\Http\Resources\Api\Client\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CertificateResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'uuid' => $this->uuid,
            'common_name' => $this->common_name,
            'organization' => $this->organization,
            'locality' => $this->locality,
            'state' => $this->state,
            'country' => $this->country,
            'san' => $this->san,
            'key_bits' => $this->key_bits,
            'key_algorithm' => $this->key_algorithm,
            'curve_name' => $this->curve_name,
            'serial_number' => $this->serial_number,
            'cert_content' => $this->cert_content,
            'csr_content' => $this->csr_content,
            'valid_from' => $this->valid_from,
            'valid_to' => $this->valid_to,
            'ssl_status' => $this->ssl_status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
