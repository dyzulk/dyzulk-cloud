<?php

$_SERVER['SERVER_PORT'] = 8001;

use App\Models\Employee;
use App\Models\SshKey;
use App\Models\Team;

function generateTestRsaKey(): string
{
    $pkey = openssl_pkey_new([
        'private_key_bits' => 2048,
        'private_key_type' => OPENSSL_KEYTYPE_RSA,
    ]);
    openssl_pkey_export($pkey, $privKey);

    return $privKey;
}

test('ssh keys page requires authentication', function () {
    $response = $this->get(route('office.ssh-keys.index'));

    $response->assertRedirect(route('office.login'));
});

test('administrator employee can access the ssh keys page', function () {
    $employee = Employee::factory()->create([
        'role' => 'administrator',
    ]);

    $response = $this->actingAs($employee, 'office')
        ->get(route('office.ssh-keys.index'));

    $response->assertStatus(200);
});

test('non-administrator employee cannot access the ssh keys page', function () {
    $employee = Employee::factory()->create([
        'role' => 'staff',
    ]);

    $response = $this->actingAs($employee, 'office')
        ->get(route('office.ssh-keys.index'));

    $response->assertStatus(403);
});

test('administrator can store a valid ssh key and it gets encrypted', function () {
    $employee = Employee::factory()->create([
        'role' => 'administrator',
    ]);

    // Create a team so relations are clean, although office sets it to null, let's verify team_id is null
    $privateKeyContent = generateTestRsaKey();

    $response = $this->actingAs($employee, 'office')
        ->post(route('office.ssh-keys.store'), [
            'name' => 'Test Key',
            'description' => 'Test description',
            'private_key' => $privateKeyContent,
        ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('ssh_keys', [
        'name' => 'Test Key',
        'type' => 'rsa',
    ]);

    $key = SshKey::where('name', 'Test Key')->first();
    expect($key)->not->toBeNull();
    expect($key->private_key)->toBe(trim($privateKeyContent));

    // Verify it is encrypted in the raw database (at-rest)
    $rawRow = DB::table('ssh_keys')->where('name', 'Test Key')->first();
    expect($rawRow->private_key)->not->toBe(trim($privateKeyContent));
    expect($rawRow->private_key)->toStartWith('eyJpdiI6'); // Laravel encryption prefix (base64 payload)
});

test('storing an invalid ssh key fails validation', function () {
    $employee = Employee::factory()->create([
        'role' => 'administrator',
    ]);

    $response = $this->actingAs($employee, 'office')
        ->from(route('office.ssh-keys.index'))
        ->post(route('office.ssh-keys.store'), [
            'name' => 'Invalid Key',
            'description' => 'Test',
            'private_key' => '-----BEGIN OPENSSH PRIVATE KEY-----'.PHP_EOL.'invalid content'.PHP_EOL.'-----END OPENSSH PRIVATE KEY-----',
        ]);

    $response->assertRedirect(route('office.ssh-keys.index'));
    $response->assertSessionHasErrors('private_key');
    $this->assertDatabaseMissing('ssh_keys', ['name' => 'Invalid Key']);
});

test('administrator can delete a global ssh key', function () {
    $employee = Employee::factory()->create([
        'role' => 'administrator',
    ]);

    $privateKeyContent = generateTestRsaKey();

    // Create the key
    $key = SshKey::create([
        'team_id' => null,
        'name' => 'Delete Me',
        'description' => 'Temp key',
        'type' => 'rsa',
        'private_key' => $privateKeyContent,
        'public_key' => 'ssh-rsa AAAAB3NzaC1yc2E...',
        'fingerprint' => 'SHA256:somefingerprint...',
    ]);

    $response = $this->actingAs($employee, 'office')
        ->delete(route('office.ssh-keys.destroy', $key));

    $response->assertRedirect();
    $this->assertDatabaseMissing('ssh_keys', ['id' => $key->id]);
});

test('administrator can request a generated ed25519 key pair via index page', function () {
    $employee = Employee::factory()->create([
        'role' => 'administrator',
    ]);

    $response = $this->actingAs($employee, 'office')
        ->get(route('office.ssh-keys.index', ['generate_type' => 'ed25519']));

    $response->assertStatus(200);

    // Assert the Inertia page has 'generatedKey' prop
    $generatedKey = $response->original->getData()['page']['props']['generatedKey'];

    expect($generatedKey)->not->toBeNull();
    expect($generatedKey['private_key'])->toStartWith('-----BEGIN OPENSSH PRIVATE KEY-----');
    expect($generatedKey['public_key'])->toStartWith('ssh-ed25519 ');
});

test('administrator can request a generated rsa key pair via index page', function () {
    $employee = Employee::factory()->create([
        'role' => 'administrator',
    ]);

    $response = $this->actingAs($employee, 'office')
        ->get(route('office.ssh-keys.index', ['generate_type' => 'rsa']));

    $response->assertStatus(200);

    // Assert the Inertia page has 'generatedKey' prop
    $generatedKey = $response->original->getData()['page']['props']['generatedKey'];

    expect($generatedKey)->not->toBeNull();
    expect($generatedKey['private_key'])->toStartWith('-----BEGIN OPENSSH PRIVATE KEY-----');
    expect($generatedKey['public_key'])->toStartWith('ssh-rsa ');
});
