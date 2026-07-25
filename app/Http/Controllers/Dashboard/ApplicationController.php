<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Application;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class ApplicationController extends Controller
{
    /**
     * Display the recently deployed applications and history.
     */
    public function index(Request $request): InertiaResponse
    {
        $team = Auth::user()->currentTeam;

        $recentlyDeployed = $team->applications()
            ->with(['deployments' => function ($query) {
                $query->latest();
            }])
            ->latest()
            ->first();

        $latestDeployments = $team->applications()
            ->join('deployments', 'applications.id', '=', 'deployments.application_id')
            ->select('deployments.*', 'applications.name as application_name')
            ->latest('deployments.created_at')
            ->take(5)
            ->get();

        return Inertia::render('dashboard/applications/index', [
            'recentlyDeployed' => $recentlyDeployed,
            'latestDeployments' => $latestDeployments,
        ]);
    }

    /**
     * Display all applications within the team.
     */
    public function list(Request $request): InertiaResponse
    {
        $team = Auth::user()->currentTeam;
        $applications = $team->applications()->latest()->get();

        return Inertia::render('dashboard/applications/applications', [
            'applications' => $applications,
        ]);
    }

    /**
     * Display team-wide provisioned resources.
     */
    public function resources(Request $request): InertiaResponse
    {
        $team = Auth::user()->currentTeam;
        $resources = $team->applicationResources()->latest()->get();

        return Inertia::render('dashboard/applications/resources', [
            'resources' => $resources,
        ]);
    }

    /**
     * Display team-wide metrics usage.
     */
    public function usage(Request $request): InertiaResponse
    {
        return Inertia::render('dashboard/applications/usage');
    }

    /**
     * Display team-wide settings.
     */
    public function settings(Request $request): InertiaResponse
    {
        return Inertia::render('dashboard/applications/settings');
    }

    /**
     * Show create application screen.
     */
    public function create(Request $request): InertiaResponse
    {
        $team = Auth::user()->currentTeam;
        $gitConnections = $team->gitConnections()->latest()->get();

        return Inertia::render('dashboard/applications/create', [
            'gitConnections' => $gitConnections,
            'gitHubAppUrl' => config('services.github.app_url') ?: 'https://github.com/apps/dyzulk-cloud/installations/new',
        ]);
    }

    /**
     * Store a newly created application.
     */
    public function store(Request $request): RedirectResponse
    {
        $team = Auth::user()->currentTeam;

        $validated = $request->validate([
            'name' => ['required', 'string', 'alpha_dash', 'max:50', 'unique:applications,name'],
            'display_name' => ['required', 'string', 'max:255'],
            'git_connection_id' => ['nullable', 'exists:git_connections,id'],
            'git_repository_id' => ['nullable', 'string', 'max:255'],
            'repository_name' => ['nullable', 'string', 'max:255'],
            'branch' => ['required', 'string', 'max:100'],
            'compute_size' => ['required', 'string', 'max:100'],
            'region' => ['required', 'string', 'max:100'],
        ]);

        $application = $team->applications()->create([
            'uuid' => (string) Str::uuid(),
            'git_connection_id' => $validated['git_connection_id'] ?? null,
            'name' => $validated['name'],
            'display_name' => $validated['display_name'],
            'environment' => 'production',
            'region' => $validated['region'],
            'git_repository_id' => $validated['git_repository_id'] ?? null,
            'repository_name' => $validated['repository_name'] ?? null,
            'branch' => $validated['branch'],
            'compute_size' => $validated['compute_size'],
            'status' => 'idle',
            'port' => 80,
        ]);

        return redirect()->route('applications.manage.overview', [
            'current_team' => $team->slug,
            'application' => $application->name,
        ])->with('success', 'Application created successfully!');
    }
}
