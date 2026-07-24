<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Application;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class ApplicationManagementController extends Controller
{
    /**
     * Ensure the application belongs to the current team.
     */
    protected function authorizeApplication(Application $application): void
    {
        if ($application->team_id !== Auth::user()->currentTeam->id) {
            abort(403, 'Unauthorized access to this application.');
        }
    }

    /**
     * Display the application overview.
     */
    public function overview(string $currentTeam, Application $application): InertiaResponse
    {
        $this->authorizeApplication($application);

        $application->load(['deployments' => function ($query) {
            $query->latest()->take(5);
        }, 'domains', 'applicationResources']);

        return Inertia::render('dashboard/applications/manage/overview', [
            'application' => [
                'name' => $application->name,
                'environment' => $application->environment,
                'region' => $application->region,
                'repository' => $application->repository_name ?? 'N/A',
                'branch' => $application->branch,
                'compute' => $application->compute_size,
                'status' => $application->status,
                'deployments' => $application->deployments,
                'domains' => $application->domains,
                'resources' => $application->applicationResources,
            ],
        ]);
    }

    /**
     * Display the application deployment history.
     */
    public function deployments(string $currentTeam, Application $application): InertiaResponse
    {
        $this->authorizeApplication($application);

        $deployments = $application->deployments()->latest()->paginate(10);

        return Inertia::render('dashboard/applications/manage/deployments', [
            'application' => $application,
            'deployments' => $deployments,
        ]);
    }

    /**
     * Display the application CLI commands console.
     */
    public function commands(string $currentTeam, Application $application): InertiaResponse
    {
        $this->authorizeApplication($application);

        return Inertia::render('dashboard/applications/manage/commands', [
            'application' => $application,
        ]);
    }

    /**
     * Display the application runtime logs.
     */
    public function logs(string $currentTeam, Application $application): InertiaResponse
    {
        $this->authorizeApplication($application);

        return Inertia::render('dashboard/applications/manage/logs', [
            'application' => $application,
        ]);
    }

    /**
     * Display the application performance metrics.
     */
    public function metrics(string $currentTeam, Application $application): InertiaResponse
    {
        $this->authorizeApplication($application);

        return Inertia::render('dashboard/applications/manage/metrics', [
            'application' => $application,
        ]);
    }

    /**
     * Display the resources attached to this application.
     */
    public function resources(string $currentTeam, Application $application): InertiaResponse
    {
        $this->authorizeApplication($application);

        $resources = $application->applicationResources()->latest()->get();

        return Inertia::render('dashboard/applications/manage/resources', [
            'application' => $application,
            'resources' => $resources,
        ]);
    }

    /**
     * Display the application environment variables.
     */
    public function envVars(string $currentTeam, Application $application): InertiaResponse
    {
        $this->authorizeApplication($application);

        $envVars = $application->environmentVariables()->latest()->get();

        return Inertia::render('dashboard/applications/manage/env-vars', [
            'application' => $application,
            'envVars' => $envVars,
        ]);
    }

    /**
     * Display the application settings page.
     */
    public function settings(string $currentTeam, Application $application): InertiaResponse
    {
        $this->authorizeApplication($application);

        $application->load(['domains']);

        return Inertia::render('dashboard/applications/manage/settings', [
            'application' => $application,
        ]);
    }
}
