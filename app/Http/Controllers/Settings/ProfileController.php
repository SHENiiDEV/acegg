<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileDeleteRequest;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Support\Countries;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $dial = $user->phone ? strtok($user->phone, ' ') : null;
        $phoneCountry = $user->country && Countries::dial($user->country) === $dial
            ? $user->country
            : (collect(Countries::all())->firstWhere('dial', $dial)['code'] ?? ($user->country ?? 'GB'));

        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
            'countries' => Countries::allowed(),
            'phoneCountries' => Countries::all(),
            'details' => [
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'phone_country' => $phoneCountry,
                'phone_number' => $user->phone ? trim(substr($user->phone, strlen((string) $dial))) : '',
                'date_of_birth' => $user->date_of_birth?->toDateString(),
                'address_line' => $user->address_line,
                'city' => $user->city,
                'country' => $user->country,
                'postcode' => $user->postcode,
            ],
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->forceFill($request->attributesForUser());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Profile updated.')]);

        return to_route('profile.edit');
    }

    /**
     * Delete the user's profile.
     */
    public function destroy(ProfileDeleteRequest $request): RedirectResponse
    {
        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
