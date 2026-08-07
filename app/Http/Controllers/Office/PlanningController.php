<?php

namespace App\Http\Controllers\Office;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class PlanningController extends Controller
{
    /**
     * Display the Planning page.
     */
    public function index(): Response
    {
        return Inertia::render('office/planning/index');
    }
}
