<?php

namespace App\Http\Controllers\Office;

use App\Http\Controllers\Controller;
use App\Models\SshKey;
use App\Rules\ValidSshPrivateKey;
use App\Services\SshKeyService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SshKeyController extends Controller
{
    /**
     * Create a new controller instance.
     */
    public function __construct(
        protected SshKeyService $sshKeyService
    ) {}

    /**
     * Display a listing of the SSH Keys.
     */
    public function index(Request $request): Response
    {
        // Display global system-wide keys (team_id is null) in the Office admin portal
        $keys = SshKey::whereNull('team_id')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('office/ssh-keys/index', [
            'sshKeys' => $keys,
        ]);
    }

    /**
     * Store a newly created SSH key in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $creationMethod = $request->input('creation_method', 'import');

        if ($creationMethod === 'generate') {
            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'description' => ['nullable', 'string', 'max:1000'],
                'type' => ['required', 'string', 'in:rsa,ed25519'],
            ]);

            $this->sshKeyService->generateAndCreateKey($validated, null);
        } else {
            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'description' => ['nullable', 'string', 'max:1000'],
                'private_key' => ['required', 'string', new ValidSshPrivateKey],
            ]);

            $this->sshKeyService->createKey($validated, null);
        }

        return back();
    }

    /**
     * Remove the specified SSH key from storage.
     */
    public function destroy(Request $request, SshKey $sshKey): RedirectResponse
    {
        // Ensure the key is a global system-wide key (team_id is null)
        if ($sshKey->team_id !== null) {
            abort(403, 'Unauthorized.');
        }

        $this->sshKeyService->deleteKey($sshKey);

        return back();
    }
}
