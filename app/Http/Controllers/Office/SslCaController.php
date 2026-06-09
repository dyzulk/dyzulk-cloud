<?php

namespace App\Http\Controllers\Office;

use App\Http\Controllers\Controller;
use App\Models\CaCertificate;
use App\Services\Ssl\CaSetupService;
use App\Services\Ssl\CertificateRenewalService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class SslCaController extends Controller
{
    public function __construct(
        private CaSetupService $setupService,
        private CertificateRenewalService $renewal,
    ) {}

    /**
     * Display the CA management dashboard.
     */
    public function index(): InertiaResponse
    {
        $caCertificates = CaCertificate::orderBy('ca_type')
            ->orderByDesc('is_latest')
            ->orderByDesc('created_at')
            ->get()
            ->map(function (CaCertificate $cert) {
                return [
                    'uuid' => $cert->uuid,
                    'ca_type' => $cert->ca_type,
                    'common_name' => $cert->common_name,
                    'organization' => $cert->organization,
                    'serial_number' => $cert->serial_number,
                    'issuer_name' => $cert->issuer_name,
                    'family_id' => $cert->family_id,
                    'valid_from' => $cert->valid_from,
                    'valid_to' => $cert->valid_to,
                    'is_latest' => $cert->is_latest,
                    'created_at' => $cert->created_at,
                ];
            });

        return Inertia::render('office/ssl/ca/index', [
            'caCertificates' => $caCertificates,
            'caStatus' => $this->getCaStatus(),
        ]);
    }

    /**
     * Initialize a specific CA certificate.
     */
    public function setupCa(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ca_type' => 'required|string|in:root,root_ecc,intermediate_4096,intermediate_2048,intermediate_ecc_384,intermediate_ecc_256',
        ]);

        $caType = $validated['ca_type'];

        // Backend validation: Ensure Root exists before creating Intermediate
        if (str_starts_with($caType, 'intermediate_')) {
            $requiredRoot = str_contains($caType, '_ecc_') ? 'root_ecc' : 'root';
            if (! CaCertificate::where('ca_type', $requiredRoot)->where('is_latest', true)->exists()) {
                return back()->with('error', "Failed: {$requiredRoot} must be initialized first before generating {$caType}.");
            }
        }

        try {
            $created = $this->setupService->setupSpecificCa($caType);

            if ($created) {
                return redirect()->back()->with('success', "Certificate Authority '{$caType}' successfully generated.");
            }

            return back()->with('error', "CA '{$caType}' is already initialized.");
        } catch (Exception $e) {
            return back()->with('error', 'Failed to initialize CA: '.$e->getMessage());
        }
    }

    /**
     * Renew a single CA certificate.
     */
    public function renew(CaCertificate $certificate): RedirectResponse
    {
        $days = match ($certificate->ca_type) {
            'root' => config('openssl.durations.root', 18250),
            default => config('openssl.durations.intermediate', 9125),
        };

        $this->renewal->executeRenewalFlow($certificate, $days);

        return back()->with('success', "CA certificate '{$certificate->common_name}' renewed successfully.");
    }

    /**
     * Renew the entire CA chain (Root + all Intermediates).
     */
    public function renewAll(): RedirectResponse
    {
        $this->renewal->bulkRenewStrategy();

        return back()->with('success', 'All CA certificates renewed successfully.');
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
}
