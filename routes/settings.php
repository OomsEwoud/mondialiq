<?php

use App\Http\Controllers\Settings\DeleteAccountController;
use App\Http\Controllers\Settings\EditAccountController;
use App\Http\Controllers\Settings\UpdateAccountController;
use App\Http\Controllers\Settings\UpdatePasswordController;
use App\Http\Controllers\Settings\UpdatePredictionPreferencesController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', EditAccountController::class)->name('edit-account');
    Route::patch('settings/profile', UpdateAccountController::class)->name('update-account');
    Route::patch('settings/prediction-preferences', UpdatePredictionPreferencesController::class)
        ->name('update-prediction-preferences');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::delete('settings/profile', DeleteAccountController::class)->name('delete-account');

    Route::put('settings/password', UpdatePasswordController::class)
        ->middleware('throttle:6,1')
        ->name('update-password');
});
