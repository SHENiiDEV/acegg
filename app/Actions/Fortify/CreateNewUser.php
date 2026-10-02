<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            ...$this->profileRules(),
            'date_of_birth' => $this->dateOfBirthRules(),
            'password' => $this->passwordRules(),
            'terms' => ['accepted'],
        ], [
            ...$this->profileMessages(),
            'terms.accepted' => 'Please accept the Terms & Conditions and Privacy Policy.',
        ])->validate();

        $user = new User;
        $user->forceFill([
            ...$this->profileAttributes($input),
            'date_of_birth' => $input['date_of_birth'],
            'password' => $input['password'],
            'terms_accepted_at' => now(),
        ])->save();

        return $user;
    }
}
