<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class LoginResponse implements LoginResponseContract
{
    public function toResponse($request)
    {
        $request->session()->forget('url.intended');

        if ($request->wantsJson()) {
            return new JsonResponse(['two_factor' => false]);
        }

        return to_route('dashboard');
    }
}
