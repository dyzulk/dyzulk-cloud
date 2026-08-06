<?php

use App\Exceptions\ApiExceptionHandler;
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
use Laravel\Sanctum\Http\Middleware\CheckAbilities;
use Laravel\Sanctum\Http\Middleware\CheckForAnyAbility;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        commands: __DIR__.'/../routes/console.php',
        using: function () {
            $port = (int) (($_SERVER['SERVER_PORT'] ?? null) ?: (request()->server('SERVER_PORT') ?: (request()->getPort() ?: 8000)));

            // 1. Manual registration for Health Check route
            Route::any('/up', function () {
                return response()->noContent();
            });

            // 2. Port 8002 -> REST API at root, otherwise under '/api' prefix
            if ($port === 8002) {
                Route::middleware('api')
                    ->group(base_path('routes/api.php'));
            } else {
                Route::middleware('api')
                    ->prefix('api')
                    ->group(base_path('routes/api.php'));
            }

            // 3. Port 8001 -> Office Dashboard at root
            if ($port === 8001) {
                Route::middleware('office')
                    ->group(base_path('routes/office.php'));
            } elseif (app()->runningInConsole()) {
                Route::middleware('office')
                    ->domain('office.localhost')
                    ->group(base_path('routes/office.php'));
            }

            // 4. Default web routes (only loaded on non-specialized ports, or in console)
            if ($port !== 8001 && $port !== 8002) {
                Route::middleware('web')
                    ->group(base_path('routes/web.php'));
            }
        },
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->trustProxies(at: '*');

        $middleware->redirectGuestsTo(function (Request $request) {
            $port = (int) (($_SERVER['SERVER_PORT'] ?? null) ?: ($request->server('SERVER_PORT') ?: ($request->getPort() ?: 8000)));

            if ($port === 8001 || str_contains($request->getHost(), 'office.')) {
                return route('office.login');
            }

            return route('login');
        });

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
            'abilities' => CheckAbilities::class,
            'ability' => CheckForAnyAbility::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api*') || (int) ($request->getPort() ?: $request->server('SERVER_PORT', 8000)) === 8002,
        );

        $exceptions->render(function (Throwable $e, Request $request) {
            $isApi = $request->expectsJson() || $request->is('api*') || (int) ($request->getPort() ?: $request->server('SERVER_PORT', 8000)) === 8002;
            if ($isApi) {
                return app(ApiExceptionHandler::class)->handle($e, $request);
            }
        });
    })->create();
