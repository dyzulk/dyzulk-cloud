<?php

$_SERVER['SERVER_PORT'] = 8001;

use App\Jobs\SetupServerJob;
use App\Jobs\ValidateServerJob;
use App\Models\Employee;
use App\Models\Server;
use App\Models\SshKey;
use Illuminate\Support\Facades\Queue;

test('server management page requires authentication', function () {
    $response = $this->get(route('office.server.index'));

    $response->assertRedirect(route('office.login'));
});

test('administrator employee can access the server management page', function () {
    $employee = Employee::factory()->create([
        'role' => 'administrator',
    ]);

    $response = $this->actingAs($employee, 'office')
        ->get(route('office.server.index'));

    $response->assertStatus(200);
});

test('non-administrator employee cannot access the server management page', function () {
    $employee = Employee::factory()->create([
        'role' => 'staff',
    ]);

    $response = $this->actingAs($employee, 'office')
        ->get(route('office.server.index'));

    $response->assertStatus(403);
});

test('administrator can store a server which dispatches validation and setup jobs', function () {
    Queue::fake();

    $employee = Employee::factory()->create(['role' => 'administrator']);
    $sshKey = SshKey::create([
        'name' => 'Key 1',
        'type' => 'ed25519',
        'private_key' => '-----BEGIN OPENSSH PRIVATE KEY-----...fake',
        'public_key' => 'ssh-ed25519 AAAAC3...fake',
        'fingerprint' => 'fake-fingerprint',
    ]);

    $response = $this->actingAs($employee, 'office')
        ->post(route('office.server.store'), [
            'name' => 'New Node',
            'description' => 'A Swarm Node',
            'host' => 'node.example.com',
            'port' => 22,
            'username' => 'root',
            'type' => 'node',
            'ssh_key_id' => $sshKey->id,
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('servers', [
        'name' => 'New Node',
        'host' => 'node.example.com',
        'type' => 'node',
    ]);

    $server = Server::where('name', 'New Node')->first();
    Queue::assertPushed(ValidateServerJob::class, function ($job) use ($server) {
        return $job->server->id === $server->id;
    });
    Queue::assertPushed(SetupServerJob::class, function ($job) use ($server) {
        return $job->server->id === $server->id;
    });
});

test('administrator can delete a server', function () {
    $employee = Employee::factory()->create(['role' => 'administrator']);
    $sshKey = SshKey::create([
        'name' => 'Key 1',
        'type' => 'ed25519',
        'private_key' => '-----BEGIN OPENSSH PRIVATE KEY-----...fake',
        'public_key' => 'ssh-ed25519 AAAAC3...fake',
        'fingerprint' => 'fake-fingerprint',
    ]);
    $server = Server::create([
        'name' => 'Delete Me',
        'host' => 'delete.example.com',
        'port' => 22,
        'username' => 'root',
        'type' => 'node',
        'ssh_key_id' => $sshKey->id,
    ]);

    $response = $this->actingAs($employee, 'office')
        ->delete(route('office.server.destroy', $server));

    $response->assertRedirect();
    $this->assertDatabaseMissing('servers', ['id' => $server->id]);
});

test('administrator can trigger setup manually', function () {
    Queue::fake();

    $employee = Employee::factory()->create(['role' => 'administrator']);
    $sshKey = SshKey::create([
        'name' => 'Key 1',
        'type' => 'ed25519',
        'private_key' => '-----BEGIN OPENSSH PRIVATE KEY-----...fake',
        'public_key' => 'ssh-ed25519 AAAAC3...fake',
        'fingerprint' => 'fake-fingerprint',
    ]);
    $server = Server::create([
        'name' => 'Setup Target',
        'host' => 'setup.example.com',
        'port' => 22,
        'username' => 'root',
        'type' => 'node',
        'ssh_key_id' => $sshKey->id,
    ]);

    $response = $this->actingAs($employee, 'office')
        ->post(route('office.server.setup', $server));

    $response->assertRedirect();
    Queue::assertPushed(ValidateServerJob::class, function ($job) use ($server) {
        return $job->server->id === $server->id;
    });
    Queue::assertPushed(SetupServerJob::class, function ($job) use ($server) {
        return $job->server->id === $server->id;
    });
});
