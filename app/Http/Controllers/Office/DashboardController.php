<?php

namespace App\Http\Controllers\Office;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Models\Deployment;
use App\Models\Team;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the office dashboard.
     */
    public function __invoke(): Response
    {
        $stats = [
            'total_users' => User::count(),
            'total_teams' => Team::count(),
            'total_certificates' => Certificate::count(),
            'total_deployments' => Deployment::count(),
        ];

        return Inertia::render('office/dashboard', [
            'stats' => $stats,
        ]);
    }
}
