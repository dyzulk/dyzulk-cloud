<?php

namespace App\Http\Controllers\Office;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class DockerController extends Controller
{
    /**
     * Display the Docker management page.
     */
    public function index(): Response
    {
        return Inertia::render('office/docker/index');
    }
}
