<?php

namespace App\Providers;

use App\Models\SiteSetting;
use Carbon\CarbonImmutable;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDynamicDomains();
        $this->configureDefaults();

        if (env('FORCE_HTTPS', false)) {
            URL::forceScheme('https');
        }

        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });
    }

    /**
     * Dynamically override Control Plane domains from site_settings table.
     */
    protected function configureDynamicDomains(): void
    {
        try {
            if (Schema::hasTable('site_settings')) {
                $appDomain = SiteSetting::get('app_domain') ?: config('app.domain');
                $officeDomain = SiteSetting::get('office_domain') ?: config('app.office.domain');
                $apiDomain = SiteSetting::get('api_domain') ?: config('app.api.domain');
                $sessionDomainSetting = SiteSetting::get('session_domain');

                $sessionDomain = ($sessionDomainSetting !== null && $sessionDomainSetting !== '')
                    ? $sessionDomainSetting
                    : config('session.domain');

                $stateful = config('sanctum.stateful', []);
                if (is_string($stateful)) {
                    $stateful = explode(',', $stateful);
                }

                $stateful = array_unique(array_filter(array_merge($stateful, [
                    $appDomain,
                    $officeDomain,
                    $apiDomain,
                    'localhost:8000',
                    'localhost:8001',
                    'localhost:8002',
                    'localhost',
                ])));

                config([
                    'app.domain' => $appDomain,
                    'app.office.domain' => $officeDomain,
                    'app.api.domain' => $apiDomain,
                    'session.domain' => $sessionDomain ?: null,
                    'sanctum.stateful' => $stateful,
                ]);
            }
        } catch (\Throwable $e) {
            // Catch early DB bootstrapping exceptions
        }
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
