<?php

use App\Http\Controllers\Pages\HomeController;
use App\Http\Controllers\Pages\GroupsController;
use App\Http\Controllers\Pages\LeaderboardsController;
use App\Http\Controllers\Pages\MatchDetailsController;
use App\Http\Controllers\Pages\MatchesController;
use App\Http\Controllers\Pages\PredictionsController;
use App\Http\Controllers\Pages\TeamDetailsController;
use App\Http\Controllers\Leagues\CreateLeaguePageController;
use App\Http\Controllers\Leagues\JoinLeagueController;
use App\Http\Controllers\Leagues\JoinLeaguePageController;
use App\Http\Controllers\Leagues\RemoveLeagueMemberController;
use App\Http\Controllers\Leagues\RefreshLeagueCodeController;
use App\Http\Controllers\Leagues\ShowLeagueController;
use App\Http\Controllers\Leagues\ShowLeagueSettingsController;
use App\Http\Controllers\Leagues\StoreLeagueController;
use App\Http\Controllers\Leagues\TransferLeagueOwnershipController;
use App\Http\Controllers\Leagues\UpdateLeagueController;
use App\Http\Controllers\Predictions\StoreMatchPredictionController;
use App\Http\Controllers\Socialite\CallbackController;
use App\Http\Controllers\Socialite\RedirectController;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');
Route::get('/matches', MatchesController::class)->name('matches');
Route::get('/matches/{fixture}', MatchDetailsController::class)->name('matches.show');
Route::post('/matches/{fixture}/prediction', StoreMatchPredictionController::class)
    ->middleware(['auth', 'throttle:prediction-store'])
    ->name('matches.prediction.store');
Route::get('/teams/{team}', TeamDetailsController::class)->name('teams.show');
Route::get('/groups', GroupsController::class)->name('groups');
Route::get('/leaderboards', LeaderboardsController::class)
    ->middleware('auth')
    ->name('leaderboards');
Route::get('/leagues/create', CreateLeaguePageController::class)
    ->middleware('auth')
    ->name('leagues.create');
Route::get('/leagues/join', JoinLeaguePageController::class)
    ->middleware('auth')
    ->name('leagues.join');
Route::post('/leagues', StoreLeagueController::class)
    ->middleware('auth')
    ->name('leagues.store');
Route::post('/leagues/join', JoinLeagueController::class)
    ->middleware('auth')
    ->name('leagues.join.store');
Route::get('/leagues/{scoreboard}', ShowLeagueController::class)
    ->middleware('auth')
    ->name('leagues.show');
Route::get('/leagues/{scoreboard}/settings', ShowLeagueSettingsController::class)
    ->middleware('auth')
    ->name('leagues.settings');
Route::patch('/leagues/{scoreboard}', UpdateLeagueController::class)
    ->middleware(['auth', 'throttle:league-manage'])
    ->name('leagues.update');
Route::post('/leagues/{scoreboard}/refresh-code', RefreshLeagueCodeController::class)
    ->middleware(['auth', 'throttle:league-manage'])
    ->name('leagues.refresh-code');
Route::delete('/leagues/{scoreboard}/members/{member}', RemoveLeagueMemberController::class)
    ->middleware(['auth', 'throttle:league-manage'])
    ->name('leagues.members.destroy');
Route::post('/leagues/{scoreboard}/owner/{member}', TransferLeagueOwnershipController::class)
    ->middleware(['auth', 'throttle:league-manage'])
    ->name('leagues.owner.transfer');
Route::get('/predictions', PredictionsController::class)->name('predictions');

Route::get('/auth/{provider}/redirect', RedirectController::class)
    ->middleware('throttle:social-auth')
    ->name('auth.redirect');
Route::get('/auth/{provider}/callback', CallbackController::class)
    ->middleware('throttle:social-auth')
    ->name('auth.callback');

require __DIR__.'/settings.php';
