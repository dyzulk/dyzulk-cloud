<?php

namespace App\Http\Controllers\Office;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class MarketingController extends Controller
{
    /**
     * Display the Marketing page.
     */
    public function index(): Response
    {
        return Inertia::render('office/marketing/index');
    }
}
