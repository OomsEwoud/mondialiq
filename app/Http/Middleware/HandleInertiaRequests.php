<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $avatar = $user?->getAttribute('avatar');

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user
                    ? [
                        ...$user->only([
                            'id',
                            'name',
                            'email',
                            'email_verified_at',
                            'social_provider',
                            'avatar_type',
                            'created_at',
                            'updated_at',
                        ]),
                        'avatar' => $avatar
                            ? (Str::startsWith($avatar, ['http://', 'https://'])
                                ? $avatar
                                : Storage::url($avatar))
                            : null,
                        'has_password' => filled(
                            $user->getAttribute('password'),
                        ),
                        'is_sso_only' => blank(
                            $user->getAttribute('password'),
                        ) && filled($user->getAttribute('social_provider')),
                    ]
                    : null,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
