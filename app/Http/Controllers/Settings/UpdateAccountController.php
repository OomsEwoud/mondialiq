<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class UpdateAccountController extends Controller
{
    public function __invoke(ProfileUpdateRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $request->user()->fill(Arr::except($validated, 'avatar'));

        if ($request->hasFile('avatar')) {
            $avatar = $request->user()->getAttribute('avatar');

            if ($avatar && ! Str::startsWith($avatar, ['http://', 'https://'])) {
                Storage::disk('public')->delete($avatar);
            }

            $request->user()->avatar = $request->file('avatar')->store('avatars', 'public');
            $request->user()->avatar_type = 'upload';
        }

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Profile updated.')]);

        return to_route('edit-account');
    }
}
