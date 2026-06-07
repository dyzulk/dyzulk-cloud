<?php

namespace App\Http\Controllers\Office;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the office dashboard.
     */
    public function __invoke(): Response
    {
        return Inertia::render('office/dashboard');
    }
}
