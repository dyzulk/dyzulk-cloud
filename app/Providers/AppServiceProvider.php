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
                $instanceUrl = SiteSetting::get('instance_url');
                if ($instanceUrl) {
                    $host = parse_url($instanceUrl, PHP_URL_HOST);
                    if ($host && $host !== 'localhost' && $host !== '127.0.0.1') {
                        config([
                            'app.domain' => $host,
                            'app.office.domain' => 'office.'.$host,
                            'app.api.domain' => 'api.'.$host,
                            'session.domain' => '.'.$host,
                        ]);
                    }
                }
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
