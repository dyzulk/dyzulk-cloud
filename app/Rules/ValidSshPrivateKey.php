<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\Process;
use Illuminate\Translation\PotentiallyTranslatedString;

class ValidSshPrivateKey implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  Closure(string, ?string=): PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (empty($value) || ! is_string($value)) {
            $fail('The :attribute must be a string.');

            return;
        }

        // Create a temporary file to run ssh-keygen validation against
        $tempFile = tempnam(sys_get_temp_dir(), 'ssh_key_val_');
        if ($tempFile === false) {
            $fail('Internal error validating SSH key.');

            return;
        }

        // Ensure key ends with a newline
        $content = trim($value)."\n";
        file_put_contents($tempFile, $content);
        chmod($tempFile, 0600);

        try {
            // ssh-keygen -y reads the private key and outputs the public key.
            // If the key is invalid or passphrase-protected, it will exit with a non-zero status.
            $result = Process::run(['ssh-keygen', '-y', '-P', '', '-f', $tempFile]);

            if (! $result->successful()) {
                $fail('The :attribute is not a valid, unpassphrased SSH private key.');
            }
        } finally {
            if (file_exists($tempFile)) {
                unlink($tempFile);
            }
        }
    }
}
