<?php

namespace App\Http\Controllers\Api\Client\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\Client\V1\CertificateResource;
use App\Models\CaCertificate;
use App\Models\Certificate;
use App\Models\Team;
use App\Services\Ssl\LeafGeneratorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CertificateApiController extends Controller
{
    public function __construct(
        private LeafGeneratorService $generator,
    ) {}

    /**
     * List all certificates across all teams the authenticated user belongs to.
     */
    public function indexGlobal(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 10);
        $search = $request->input('search');

        $teamIds = $request->user()->teams()->pluck('teams.id');

        $query = Certificate::whereIn('team_id', $teamIds);

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
            'success' => true,
            'data' => $certificates,
        ]);
    }

    /**
     * List certificates for a specific team (identified by UUID).
     */
    public function index(Request $request, Team $team): JsonResponse
    {
        $this->authorizeTeamAccess($request, $team);

        $perPage = $request->input('per_page', 10);
        $search = $request->input('search');

        $query = Certificate::where('team_id', $team->id);

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
            'success' => true,
            'data' => $certificates,
            'ca_status' => $this->getCaStatus(),
        ]);
    }

    /**
     * Generate a new certificate for a specific team (identified by UUID).
     */
    public function generate(Request $request, Team $team): JsonResponse
    {
        $this->authorizeTeamAccess($request, $team);

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

        $caStatus = $this->getCaStatus();

        if ($validated['algorithm'] === 'rsa') {
            $keyBits = $validated['key_bits'] ?? '2048';
            if ($keyBits === '2048' && ! $caStatus['intermediate_2048']) {
                throw ValidationException::withMessages(['key_bits' => 'The Intermediate CA for RSA 2048 is not available.']);
            }
            if ($keyBits === '4096' && ! $caStatus['intermediate_4096']) {
                throw ValidationException::withMessages(['key_bits' => 'The Intermediate CA for RSA 4096 is not available.']);
            }
        } else {
            $curveName = $validated['curve_name'] ?? 'prime256v1';
            if ($curveName === 'prime256v1' && ! $caStatus['intermediate_ecc_256']) {
                throw ValidationException::withMessages(['curve_name' => 'The Intermediate CA for ECC prime256v1 is not available.']);
            }
            if ($curveName === 'secp384r1' && ! $caStatus['intermediate_ecc_384']) {
                throw ValidationException::withMessages(['curve_name' => 'The Intermediate CA for ECC secp384r1 is not available.']);
            }
        }

        if ($validated['config_mode'] === 'default') {
            $defaults = Config::get('openssl.ca_leaf_default');
            $validated['organization'] = $defaults['organizationName'];
            $validated['locality'] = $defaults['localityName'];
            $validated['state'] = $defaults['stateOrProvinceName'];
            $validated['country'] = $defaults['countryName'];
        }

        $result = $this->generator->generateLeaf($validated);

        $certificate = Certificate::create([
            'team_id' => $team->id,
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
            'success' => true,
            'message' => 'Certificate generated successfully',
            'data' => new CertificateResource($certificate),
        ], 201);
    }

    /**
     * Download a certificate file (cert, key, or csr).
     */
    public function download(Request $request, Certificate $certificate, string $type): Response
    {
        $this->authorizeCertificateAccess($request, $certificate);

        $content = match ($type) {
            'cert' => $certificate->cert_content,
            'key' => $certificate->key_content,
            'csr' => $certificate->csr_content,
            default => abort(404),
        };

        $extension = match ($type) {
            'cert' => 'crt',
            'key' => 'key',
            'csr' => 'csr',
        };

        $filename = Str::slug($certificate->common_name).'.'.$extension;

        return response($content)
            ->header('Content-Type', 'text/plain')
            ->header('Content-Disposition', "attachment; filename={$filename}");
    }

    /**
     * Ensure the authenticated user is a member of the given team.
     */
    private function authorizeTeamAccess(Request $request, Team $team): void
    {
        if (! $request->user()->belongsToTeam($team)) {
            abort(403, 'You do not have access to this team.');
        }
    }

    /**
     * Ensure the authenticated user has access to the certificate's team.
     */
    private function authorizeCertificateAccess(Request $request, Certificate $certificate): void
    {
        $teamIds = $request->user()->teams()->pluck('teams.id');

        if (! $teamIds->contains($certificate->team_id)) {
            abort(403, 'You do not have access to this certificate.');
        }
    }

    /**
     * Get the current CA status.
     *
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
            'is_ready' => $int2048 || $int4096 || $intEcc256 || $intEcc384,
        ];
    }
}
