<?php

use App\Http\Controllers\Settings\DeleteAccountController;
use App\Http\Controllers\Settings\EditAccountController;
use App\Http\Controllers\Settings\UpdateAccountController;
use App\Http\Controllers\Settings\UpdatePasswordController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', EditAccountController::class)->name('edit-account');
    Route::patch('settings/profile', UpdateAccountController::class)->name('update-account');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::delete('settings/profile', DeleteAccountController::class)->name('delete-account');

    Route::put('settings/password', UpdatePasswordController::class)
        ->middleware('throttle:6,1')
        ->name('update-password');
});
