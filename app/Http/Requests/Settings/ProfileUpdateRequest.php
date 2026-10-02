<?php

namespace App\Http\Requests\Settings;

use App\Concerns\ProfileValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ProfileUpdateRequest extends FormRequest
{
    use ProfileValidationRules;

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return $this->profileRules($this->user()->id);
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return $this->profileMessages();
    }

    /** @return array<string, mixed> */
    public function attributesForUser(): array
    {
        return $this->profileAttributes($this->validated());
    }
}
