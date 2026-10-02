<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Fortify\Features;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->skipUnlessFortifyHas(Features::registration());
    }

    public function test_registration_screen_can_be_rendered()
    {
        $response = $this->get(route('register'));

        $response->assertOk();
    }

    /** @return array<string, string> */
    private function validRegistration(array $overrides = []): array
    {
        return [
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'first_name' => 'Test',
            'last_name' => 'User',
            'phone_country' => 'LV',
            'phone_number' => '20 123 456',
            'date_of_birth' => '1990-05-20',
            'address_line' => 'Brivibas iela 1, apt. 5',
            'city' => 'Riga',
            'country' => 'LV',
            'postcode' => 'LV-1010',
            'terms' => '1',
            ...$overrides,
        ];
    }

    public function test_new_users_can_register()
    {
        $response = $this->post(route('register.store'), $this->validRegistration());

        $this->assertAuthenticated();
        $response->assertRedirect(route('home', absolute: false));

        $user = \App\Models\User::firstWhere('email', 'test@example.com');
        $this->assertSame('Test User', $user->name);
        $this->assertSame('+371 20123456', $user->phone);
        $this->assertSame('LV', $user->country);
        $this->assertNotNull($user->terms_accepted_at);
    }

    public function test_registration_requires_terms_age_and_allowed_country()
    {
        $this->post(route('register.store'), $this->validRegistration(['terms' => '']))->assertSessionHasErrors('terms');
        $this->post(route('register.store'), $this->validRegistration(['date_of_birth' => now()->subYears(17)->toDateString()]))->assertSessionHasErrors('date_of_birth');
        $this->post(route('register.store'), $this->validRegistration(['country' => 'RU']))->assertSessionHasErrors('country');
        $this->assertGuest();
    }
}
