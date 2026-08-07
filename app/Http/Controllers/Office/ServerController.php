<?php

namespace App\Http\Controllers\Office;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class ServerController extends Controller
{
    /**
     * Display the Server management page.
     */
    public function index(): Response
    {
        return Inertia::render('office/server/index');
    }
}
