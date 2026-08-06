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
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        then: function () {
            $port = (int) (request()->getPort() ?: request()->server('SERVER_PORT', 8000));

            // Port 8002 -> REST API at root
            if ($port === 8002) {
                Route::middleware('api')
                    ->group(base_path('routes/api.php'));
            } else {
                Route::middleware('api')
                    ->prefix('api')
                    ->group(base_path('routes/api.php'));
            }

            // Port 8001 -> Office Dashboard at root
            if ($port === 8001) {
                Route::middleware('office')
                    ->group(base_path('routes/office.php'));
            } else {
                Route::middleware('office')
                    ->prefix('office')
                    ->group(base_path('routes/office.php'));
            }
        },
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->trustProxies(at: '*');

        $middleware->redirectGuestsTo(function (Request $request) {
            $port = (int) ($request->getPort() ?: $request->server('SERVER_PORT', 8000));

            if ($request->is('office*') || $port === 8001) {
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
