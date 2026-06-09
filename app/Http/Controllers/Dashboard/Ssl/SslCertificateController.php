<?php

namespace App\Http\Controllers\Dashboard\Ssl;

use App\Http\Controllers\Controller;
use App\Models\CaCertificate;
use App\Models\Certificate;
use App\Services\Ssl\LeafGeneratorService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class SslCertificateController extends Controller
{
    public function __construct(
        private LeafGeneratorService $generator,
    ) {}

    /**
     * Display a listing of the user's certificates.
     */
    public function index(Request $request): InertiaResponse
    {
        $query = Certificate::where('team_id', Auth::user()->currentTeam->id);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('common_name', 'like', "%{$search}%")
                    ->orWhere('serial_number', 'like', "%{$search}%")
                    ->orWhere('san', 'like', "%{$search}%");
            });
        }

        $certificates = $query->latest()->paginate(10);

        return Inertia::render('dashboard/ssl/certificates/index', [
            'certificates' => $certificates,
            'caStatus' => $this->getCaStatus(),
            'filters' => $request->only('search'),
        ]);
    }

    /**
     * Store a newly generated certificate.
     */
    public function store(Request $request): RedirectResponse
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

        Certificate::create([
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

        return back()->with('success', 'Certificate generated successfully.');
    }

    /**
     * Show a single certificate's details.
     */
    public function show(string $currentTeam, Certificate $certificate): InertiaResponse
    {
        $this->authorizeOwner($certificate);

        return Inertia::render('dashboard/ssl/certificates/show', [
            'certificate' => $certificate,
        ]);
    }

    /**
     * Delete a certificate.
     */
    public function destroy(string $currentTeam, Certificate $certificate): RedirectResponse
    {
        $this->authorizeOwner($certificate);
        $certificate->delete();

        return redirect()->route('ssl.certificates.index', $currentTeam)
            ->with('success', 'Certificate deleted successfully.');
    }

    /**
     * Download a certificate file (cert, key, or csr).
     */
    public function downloadFile(string $currentTeam, Certificate $certificate, string $type): Response
    {
        $this->authorizeOwner($certificate);

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

    /**
     * Ensure the authenticated user's current team owns the certificate.
     */
    private function authorizeOwner(Certificate $certificate): void
    {
        if ($certificate->team_id !== Auth::user()->currentTeam->id) {
            abort(403);
        }
    }
}
