<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Session;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class LoginResponse implements LoginResponseContract
{
    public function toResponse($request)
    {
        $intended = $request->input('intended')
            ?? Session::pull('url.intended')
            ?? config('fortify.home', '/');

        if ($request->wantsJson()) {
            return new JsonResponse(['two_factor' => false]);
        }

        return redirect()->to($intended);
    }
}
