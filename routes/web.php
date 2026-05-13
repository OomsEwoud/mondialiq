<?php

use App\Http\Controllers\Pages\HomeController;
use App\Http\Controllers\Pages\GroupsController;
use App\Http\Controllers\Pages\MatchDetailsController;
use App\Http\Controllers\Pages\MatchesController;
use App\Http\Controllers\Pages\TeamDetailsController;
use App\Http\Controllers\Socialite\CallbackController;
use App\Http\Controllers\Socialite\RedirectController;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');
Route::get('/matches', MatchesController::class)->name('matches');
Route::get('/matches/{fixture}', MatchDetailsController::class)->name('matches.show');
Route::get('/teams/{team}', TeamDetailsController::class)->name('teams.show');
Route::get('/groups', GroupsController::class)->name('groups');

Route::get('/auth/{provider}/redirect', RedirectController::class)->name('auth.redirect');
Route::get('/auth/{provider}/callback', CallbackController::class)->name('auth.callback');

require __DIR__.'/settings.php';
