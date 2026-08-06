<?php

use App\Models\Employee;
use App\Models\SiteSetting;

test('site settings page requires authentication', function () {
    $response = $this->get(route('office.settings.index'));

    $response->assertRedirect(route('office.login'));
});

test('administrator employee can access site settings page', function () {
    $employee = Employee::factory()->create([
        'role' => 'administrator',
    ]);

    $response = $this->actingAs($employee, 'office')
        ->get(route('office.settings.index'));

    $response->assertStatus(200);
});

test('non-administrator employee cannot access site settings page', function () {
    $employee = Employee::factory()->create([
        'role' => 'staff',
    ]);

    $response = $this->actingAs($employee, 'office')
        ->get(route('office.settings.index'));

    $response->assertStatus(403);
});

test('administrator can update general settings', function () {
    $employee = Employee::factory()->create([
        'role' => 'administrator',
    ]);

    $response = $this->actingAs($employee, 'office')
        ->put(route('office.settings.update', 'general'), [
            'instance_name' => 'dyzulk-cloud-prod',
            'instance_url' => 'https://cloud.dyzulk.com',
            'timezone' => 'UTC',
            'public_ipv4' => '172.31.100.15',
            'public_ipv6' => '',
            'wildcard_domain' => '*.dyzulk.com',
        ]);

    $response->assertRedirect();
    expect(SiteSetting::get('instance_name'))->toBe('dyzulk-cloud-prod');
});

test('administrator can update network settings', function () {
    $employee = Employee::factory()->create([
        'role' => 'administrator',
    ]);

    $response = $this->actingAs($employee, 'office')
        ->put(route('office.settings.update', 'network'), [
            'app_domain' => 'localhost:8000',
            'office_domain' => 'localhost:8001',
            'api_domain' => 'localhost:8002',
            'session_domain' => '.dyzulk.com',
            'control_network' => 'dyzulk-cloud-control-network',
            'traefik_version' => 'v3.1',
            'docker_pool_base' => '10.0.0.0/8',
            'docker_pool_size' => '24',
            'letsencrypt_email' => 'admin@dyzulk.com',
            'force_https' => true,
            'traefik_dashboard_enabled' => false,
        ]);

    $response->assertRedirect();
    expect(SiteSetting::get('traefik_version'))->toBe('v3.1');
    expect(SiteSetting::get('session_domain'))->toBe('.dyzulk.com');
});
