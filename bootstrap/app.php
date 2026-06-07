<?php

use App\Http\Middleware\EnsureOfficeAccess;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\HandleOfficeInertiaRequests;
use App\Http\Middleware\SetTeamUrlDefaults;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\Support\Facades\Route;
use Illuminate\View\Middleware\ShareErrorsFromSession;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        then: function () {
            $apiDomain = config('app.api.domain');
            $officeDomain = config('app.office.domain');

            // Global/Unversioned API routes
            Route::middleware('api')
                ->domain($apiDomain)
                ->group(base_path('routes/api.php'));

            // Versioned API routes (v1) - Legacy
            Route::middleware('api')
                ->domain($apiDomain)
                ->prefix('v1')
                ->group(base_path('routes/api/v1.php'));

            // Client API routes (client/v1) - Enterprise Standard
            Route::middleware('api')
                ->domain($apiDomain)
                ->prefix('client/v1')
                ->group(base_path('routes/api/client/v1.php'));

            // Office dashboard routes
            Route::middleware('office')
                ->domain($officeDomain)
                ->group(base_path('routes/office.php'));
        },
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            SetTeamUrlDefaults::class,
        ]);

        $middleware->group('office', [
            EncryptCookies::class,
            AddQueuedCookiesToResponse::class,
            StartSession::class,
            ShareErrorsFromSession::class,
            ValidateCsrfToken::class,
            SubstituteBindings::class,
            HandleAppearance::class,
            HandleOfficeInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'office.access' => EnsureOfficeAccess::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->getHost() === config('app.api.domain'),
        );
    })->create();
