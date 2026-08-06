<?php

namespace Database\Seeders;

use App\Models\SiteSetting;
use App\Services\TraefikConfigService;
use Illuminate\Database\Seeder;

class SiteSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $defaults = [
            'general' => [
                'instance_name' => 'dyzulk-cloud',
                'instance_url' => env('APP_URL', 'http://localhost'),
                'timezone' => 'UTC',
                'public_ipv4' => '172.31.100.15',
                'public_ipv6' => '',
                'wildcard_domain' => '*.dyzulk.local',
            ],
            'network' => [
                'control_network' => 'dyzulk-cloud-control-network',
                'traefik_version' => 'v3.0',
                'docker_pool_base' => '10.0.0.0/8',
                'docker_pool_size' => '24',
                'letsencrypt_email' => 'admin@dyzulk.com',
                'force_https' => true,
                'traefik_dashboard_enabled' => false,
            ],
            'email' => [
                'mail_provider' => 'smtp',
                'smtp_host' => 'smtp.mailgun.org',
                'smtp_port' => '587',
                'smtp_encryption' => 'tls',
                'smtp_username' => '',
                'smtp_password' => '',
                'mail_from_name' => 'dyzulk-cloud',
                'mail_from_address' => 'noreply@dyzulk.com',
                'resend_api_key' => '',
            ],
            'backup' => [
                'backup_enabled' => false,
                's3_bucket' => '',
                's3_region' => 'us-east-1',
                's3_endpoint' => '',
                's3_access_key' => '',
                's3_secret_key' => '',
                'backup_retention_days' => '30',
            ],
            'oauth' => [
                'github_enabled' => false,
                'github_client_id' => '',
                'github_client_secret' => '',
            ],
            'jobs' => [
                'docker_prune_schedule' => 'daily',
                'log_retention_days' => '14',
                'queue_workers_count' => '2',
            ],
        ];

        foreach ($defaults as $group => $settings) {
            foreach ($settings as $key => $val) {
                $type = is_bool($val) ? 'boolean' : (is_int($val) ? 'integer' : 'string');
                SiteSetting::set($key, $val, $group, $type);
            }
        }

        TraefikConfigService::syncControlPlaneRoutes();
    }
}
