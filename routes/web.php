<?php

use App\Http\Controllers\Pages\HomeController;
use App\Http\Controllers\Pages\GroupsController;
use App\Http\Controllers\Pages\MatchDetailsController;
use App\Http\Controllers\Pages\MatchesController;
use App\Http\Controllers\Pages\TeamDetailsController;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');
Route::get('/matches', MatchesController::class)->name('matches');
Route::get('/matches/{fixture}', MatchDetailsController::class)->name('matches.show');
Route::get('/teams/{team}', TeamDetailsController::class)->name('teams.show');
Route::get('/groups', GroupsController::class)->name('groups');

require __DIR__.'/settings.php';
