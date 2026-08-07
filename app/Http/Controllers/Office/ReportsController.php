<?php

namespace App\Http\Controllers\Office;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class ReportsController extends Controller
{
    /**
     * Display the Reports page.
     */
    public function index(): Response
    {
        return Inertia::render('office/reports/index');
    }
}
