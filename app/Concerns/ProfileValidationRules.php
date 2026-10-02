<?php

namespace App\Concerns;

use App\Models\User;
use App\Support\Countries;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

trait ProfileValidationRules
{
    /**
     * Rules shared by registration and profile update.
     *
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    protected function profileRules(?int $userId = null): array
    {
        return [
            'first_name' => ['required', 'string', 'max:100', "regex:/^[\\pL\\pM' .-]+$/u"],
            'last_name' => ['required', 'string', 'max:100', "regex:/^[\\pL\\pM' .-]+$/u"],
            'email' => $this->emailRules($userId),
            'phone_country' => ['required', 'string', 'size:2', Rule::in(array_keys(config('countries.list')))],
            'phone_number' => ['required', 'string', 'regex:/^[0-9 ()-]{5,20}$/'],
            'address_line' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:120'],
            'country' => ['required', 'string', 'size:2', Rule::in(Countries::allowedCodes())],
            'postcode' => ['required', 'string', 'max:20', 'regex:/^[A-Za-z0-9 -]{2,20}$/'],
        ];
    }

    /** Date of birth: real date, player must be 18+. */
    protected function dateOfBirthRules(): array
    {
        return ['required', 'date', 'before_or_equal:'.now()->subYears(18)->toDateString(), 'after:1900-01-01'];
    }

    /** @return array<string, string> */
    protected function profileMessages(): array
    {
        return [
            'first_name.regex' => 'Name may only contain letters, spaces, hyphens and apostrophes.',
            'last_name.regex' => 'Surname may only contain letters, spaces, hyphens and apostrophes.',
            'phone_number.regex' => 'Enter a valid phone number (digits only).',
            'country.in' => 'Unfortunately we cannot accept players from this country.',
            'date_of_birth.before_or_equal' => 'You must be at least 18 years old.',
            'postcode.regex' => 'Enter a valid post code.',
        ];
    }

    /**
     * Normalised attributes ready for User::fill().
     *
     * @param  array<string, mixed>  $input
     * @return array<string, mixed>
     */
    protected function profileAttributes(array $input): array
    {
        $first = trim((string) $input['first_name']);
        $last = trim((string) $input['last_name']);
        $digits = preg_replace('/\D+/', '', (string) $input['phone_number']);

        return [
            'first_name' => $first,
            'last_name' => $last,
            'name' => $first.' '.$last,
            'email' => $input['email'],
            'phone' => Countries::dial($input['phone_country']).' '.$digits,
            'address_line' => trim((string) $input['address_line']),
            'city' => trim((string) $input['city']),
            'country' => strtoupper((string) $input['country']),
            'postcode' => strtoupper(trim((string) $input['postcode'])),
        ];
    }

    /**
     * @return array<int, ValidationRule|array<mixed>|string>
     */
    protected function nameRules(): array
    {
        return ['required', 'string', 'max:255'];
    }

    /**
     * @return array<int, ValidationRule|array<mixed>|string>
     */
    protected function emailRules(?int $userId = null): array
    {
        return [
            'required',
            'string',
            'email',
            'max:255',
            $userId === null
                ? Rule::unique(User::class)
                : Rule::unique(User::class)->ignore($userId),
        ];
    }
}
