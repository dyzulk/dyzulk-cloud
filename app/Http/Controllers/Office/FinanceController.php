<?php

namespace App\Http\Controllers\Office;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class FinanceController extends Controller
{
    /**
     * Display the Finance page.
     */
    public function index(): Response
    {
        return Inertia::render('office/finance/index');
    }
}
