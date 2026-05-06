<?php

use App\Http\Controllers\RenderControllers\HomeController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/welcome', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('welcome');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

Route::get('/', HomeController::class)->name('home');

require __DIR__.'/settings.php';
