<?php

namespace Tests\Feature;

// use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_the_application_returns_a_successful_response(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }

    public function test_main_pages_return_success(): void
    {
        foreach (['/', '/about', '/project', '/credential/education', '/credential/experience', '/credential/certification', '/contact'] as $path) {
            $this->get($path)->assertOk();
        }
    }

    public function test_credential_redirects_to_education(): void
    {
        $this->get('/credential')->assertRedirect('/credential/education');
    }
}
