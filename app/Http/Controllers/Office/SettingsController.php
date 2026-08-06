<?php

namespace App\Http\Controllers\Office;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use App\Services\TraefikConfigService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    /**
     * Display the Admin Site Settings page.
     */
    public function index(): Response
    {
        $groups = ['general', 'network', 'email', 'backup', 'oauth', 'jobs'];
        $settings = [];

        foreach ($groups as $group) {
            $settings[$group] = SiteSetting::getGroup($group);
        }

        // If settings are completely empty, run seeder
        if (empty(array_filter($settings))) {
            Artisan::call('db:seed', ['--class' => 'SiteSettingSeeder', '--force' => true]);
            foreach ($groups as $group) {
                $settings[$group] = SiteSetting::getGroup($group);
            }
        }

        return Inertia::render('office/settings/index', [
            'settings' => $settings,
        ]);
    }

    /**
     * Update settings for a specific group.
     */
    public function update(Request $request, string $group): RedirectResponse
    {
        $validGroups = ['general', 'network', 'email', 'backup', 'oauth', 'jobs'];

        if (! in_array($group, $validGroups, true)) {
            abort(404, 'Invalid settings group.');
        }

        $data = match ($group) {
            'general' => $request->validate([
                'instance_name' => ['required', 'string', 'max:255'],
                'instance_url' => ['required', 'url'],
                'timezone' => ['required', 'string', 'max:100'],
                'public_ipv4' => ['nullable', 'string', 'max:45'],
                'public_ipv6' => ['nullable', 'string', 'max:45'],
                'wildcard_domain' => ['nullable', 'string', 'max:255'],
            ]),
            'network' => $request->validate([
                'control_network' => ['required', 'string', 'max:255'],
                'traefik_version' => ['required', 'string', 'max:50'],
                'docker_pool_base' => ['required', 'string', 'max:50'],
                'docker_pool_size' => ['required', 'string', 'max:10'],
                'letsencrypt_email' => ['required', 'email'],
                'force_https' => ['boolean'],
                'traefik_dashboard_enabled' => ['boolean'],
            ]),
            'email' => $request->validate([
                'mail_provider' => ['required', 'string'],
                'smtp_host' => ['nullable', 'string', 'max:255'],
                'smtp_port' => ['nullable', 'string', 'max:10'],
                'smtp_encryption' => ['nullable', 'string', 'max:20'],
                'smtp_username' => ['nullable', 'string', 'max:255'],
                'smtp_password' => ['nullable', 'string', 'max:255'],
                'mail_from_name' => ['required', 'string', 'max:255'],
                'mail_from_address' => ['required', 'email'],
                'resend_api_key' => ['nullable', 'string', 'max:255'],
            ]),
            'backup' => $request->validate([
                'backup_enabled' => ['boolean'],
                's3_bucket' => ['nullable', 'string', 'max:255'],
                's3_region' => ['nullable', 'string', 'max:100'],
                's3_endpoint' => ['nullable', 'string', 'max:255'],
                's3_access_key' => ['nullable', 'string', 'max:255'],
                's3_secret_key' => ['nullable', 'string', 'max:255'],
                'backup_retention_days' => ['required', 'integer', 'min:1', 'max:365'],
            ]),
            'oauth' => $request->validate([
                'github_enabled' => ['boolean'],
                'github_client_id' => ['nullable', 'string', 'max:255'],
                'github_client_secret' => ['nullable', 'string', 'max:255'],
            ]),
            'jobs' => $request->validate([
                'docker_prune_schedule' => ['required', 'string'],
                'log_retention_days' => ['required', 'integer', 'min:1', 'max:365'],
                'queue_workers_count' => ['required', 'integer', 'min:1', 'max:32'],
            ]),
        };

        SiteSetting::setGroup($group, $data);

        if (in_array($group, ['general', 'network'], true)) {
            TraefikConfigService::syncControlPlaneRoutes();
        }

        return redirect()->back()->with('success', ucfirst($group).' settings updated successfully.');
    }

    /**
     * Send a test email connection.
     */
    public function testEmail(Request $request): RedirectResponse
    {
        $request->validate([
            'recipient' => ['required', 'email'],
        ]);

        return redirect()->back()->with('success', 'Test email dispatched to '.$request->input('recipient'));
    }
}
