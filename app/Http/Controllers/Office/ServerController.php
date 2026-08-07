<?php

namespace App\Http\Controllers\Office;

use App\Http\Controllers\Controller;
use App\Jobs\SetupServerJob;
use App\Jobs\ValidateServerJob;
use App\Models\Server;
use App\Models\SshKey;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ServerController extends Controller
{
    /**
     * Display the Server management page.
     */
    public function index(): Response
    {
        $servers = Server::with(['sshKey', 'swarmManager'])
            ->orderBy('created_at', 'desc')
            ->get();

        $sshKeys = SshKey::whereNull('team_id')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('office/server/index', [
            'servers' => $servers,
            'sshKeys' => $sshKeys,
        ]);
    }

    /**
     * Store a newly created server in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'host' => ['required', 'string', 'max:255'],
            'port' => ['required', 'integer', 'min:1', 'max:65535'],
            'username' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'in:local,build,node,deploy'],
            'ssh_key_id' => ['required', 'exists:ssh_keys,id'],
            'swarm_manager_server_id' => ['nullable', 'exists:servers,id'],
        ]);

        $server = Server::create($validated);

        // Run validation and setup jobs
        ValidateServerJob::dispatch($server);
        SetupServerJob::dispatch($server);

        return back();
    }

    /**
     * Remove the specified server from storage.
     */
    public function destroy(Server $server): RedirectResponse
    {
        $server->delete();

        return back();
    }

    /**
     * Trigger setup manually for a server.
     */
    public function setup(Server $server): RedirectResponse
    {
        ValidateServerJob::dispatch($server);
        SetupServerJob::dispatch($server);

        return back();
    }
}
