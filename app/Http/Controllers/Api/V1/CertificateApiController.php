<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\CertificateResource;
use App\Models\CaCertificate;
use App\Models\Certificate;
use App\Services\Ssl\LeafGeneratorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Config;

class CertificateApiController extends Controller
{
    public function __construct(
        private LeafGeneratorService $generator,
    ) {}

    /**
     * List user certificates.
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 10);
        $search = $request->input('search');

        $query = Certificate::where('team_id', Auth::user()->currentTeam->id);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('common_name', 'like', "%{$search}%")
                    ->orWhere('serial_number', 'like', "%{$search}%")
                    ->orWhere('san', 'like', "%{$search}%");
            });
        }

        $certificates = $query->latest()->paginate($perPage);
        $certificates->getCollection()->transform(fn ($cert) => new CertificateResource($cert));

        return response()->json([
            'status' => 'success',
            'data' => $certificates,
            'ca_status' => $this->getCaStatus(),
        ]);
    }

    /**
     * Generate a new certificate.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'common_name' => ['required', 'string', 'max:255'],
            'config_mode' => ['required', 'in:default,manual'],
            'organization' => ['nullable', 'required_if:config_mode,manual', 'string', 'max:255'],
            'locality' => ['nullable', 'required_if:config_mode,manual', 'string', 'max:255'],
            'state' => ['nullable', 'required_if:config_mode,manual', 'string', 'max:255'],
            'country' => ['nullable', 'required_if:config_mode,manual', 'string', 'size:2'],
            'san' => ['nullable', 'string'],
            'algorithm' => ['required', 'in:rsa,ecc'],
            'key_bits' => ['nullable', 'required_if:algorithm,rsa', 'in:2048,4096'],
            'curve_name' => ['nullable', 'required_if:algorithm,ecc', 'in:prime256v1,secp384r1'],
        ]);

        if ($validated['config_mode'] === 'default') {
            $defaults = Config::get('openssl.ca_leaf_default');
            $validated['organization'] = $defaults['organizationName'];
            $validated['locality'] = $defaults['localityName'];
            $validated['state'] = $defaults['stateOrProvinceName'];
            $validated['country'] = $defaults['countryName'];
        }

        $result = $this->generator->generateLeaf($validated);

        $certificate = Certificate::create([
            'team_id' => Auth::user()->currentTeam->id,
            'common_name' => $validated['common_name'],
            'organization' => $validated['organization'],
            'locality' => $validated['locality'],
            'state' => $validated['state'],
            'country' => $validated['country'],
            'san' => $validated['san'] ?? null,
            'key_bits' => $validated['key_bits'] ?? null,
            'key_algorithm' => $result['key_algorithm'],
            'curve_name' => $result['curve_name'] ?? null,
            'serial_number' => $result['serial'],
            'cert_content' => $result['cert'],
            'key_content' => $result['key'],
            'csr_content' => $result['csr'],
            'valid_from' => $result['valid_from'],
            'valid_to' => $result['valid_to'],
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Certificate generated successfully',
            'data' => new CertificateResource($certificate),
        ], 201);
    }

    /**
     * Show certificate details.
     */
    public function show(Certificate $certificate): JsonResponse
    {
        $this->authorizeOwner($certificate);

        return response()->json([
            'status' => 'success',
            'data' => new CertificateResource($certificate),
        ]);
    }

    /**
     * Delete a certificate.
     */
    public function destroy(Certificate $certificate): JsonResponse
    {
        $this->authorizeOwner($certificate);
        $certificate->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Certificate deleted successfully',
        ]);
    }

    /**
     * @return array{root: bool, root_ecc: bool, intermediate_2048: bool, intermediate_4096: bool, intermediate_ecc_256: bool, intermediate_ecc_384: bool, is_ready: bool}
     */
    private function getCaStatus(): array
    {
        $root = CaCertificate::where('ca_type', 'root')->exists();
        $rootEcc = CaCertificate::where('ca_type', 'root_ecc')->exists();
        $int2048 = CaCertificate::where('ca_type', 'intermediate_2048')->exists();
        $int4096 = CaCertificate::where('ca_type', 'intermediate_4096')->exists();
        $intEcc256 = CaCertificate::where('ca_type', 'intermediate_ecc_256')->exists();
        $intEcc384 = CaCertificate::where('ca_type', 'intermediate_ecc_384')->exists();

        return [
            'root' => $root,
            'root_ecc' => $rootEcc,
            'intermediate_2048' => $int2048,
            'intermediate_4096' => $int4096,
            'intermediate_ecc_256' => $intEcc256,
            'intermediate_ecc_384' => $intEcc384,
            'is_ready' => $root && $rootEcc && $int2048 && $int4096 && $intEcc256 && $intEcc384,
        ];
    }

    private function authorizeOwner(Certificate $certificate): void
    {
        if ($certificate->team_id !== Auth::user()->currentTeam->id) {
            abort(403);
        }
    }
}
