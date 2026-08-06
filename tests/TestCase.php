<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Laravel\Fortify\Features;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        $className = get_class($this);

        if (str_contains($className, 'Tests\\Feature\\Office\\')) {
            $_SERVER['SERVER_PORT'] = 8001;
        } elseif (str_contains($className, 'Tests\\Feature\\Api\\')) {
            $_SERVER['SERVER_PORT'] = 8002;
        } else {
            unset($_SERVER['SERVER_PORT']);
        }

        parent::setUp();
    }

    protected function tearDown(): void
    {
        unset($_SERVER['SERVER_PORT']);
        parent::tearDown();
    }

    protected function skipUnlessFortifyHas(string $feature, ?string $message = null): void
    {
        if (! Features::enabled($feature)) {
            $this->markTestSkipped($message ?? "Fortify feature [{$feature}] is not enabled.");
        }
    }
}
