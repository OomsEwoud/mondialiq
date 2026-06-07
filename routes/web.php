<?php

use App\Http\Controllers\Feedback\StoreFeedbackController;
use App\Http\Controllers\Leagues\AddAiParticipantController;
use App\Http\Controllers\Leagues\CreateLeaguePageController;
use App\Http\Controllers\Leagues\DeleteLeagueController;
use App\Http\Controllers\Leagues\JoinLeagueController;
use App\Http\Controllers\Leagues\JoinLeaguePageController;
use App\Http\Controllers\Leagues\LeaveLeagueController;
use App\Http\Controllers\Leagues\RefreshLeagueCodeController;
use App\Http\Controllers\Leagues\RemoveAiParticipantController;
use App\Http\Controllers\Leagues\RemoveLeagueMemberController;
use App\Http\Controllers\Leagues\ShowLeagueController;
use App\Http\Controllers\Leagues\ShowLeagueMembersController;
use App\Http\Controllers\Leagues\ShowLeagueSettingsController;
use App\Http\Controllers\Leagues\StoreLeagueController;
use App\Http\Controllers\Leagues\TransferLeagueOwnershipController;
use App\Http\Controllers\Leagues\UpdateLeagueController;
use App\Http\Controllers\Pages\ContactController;
use App\Http\Controllers\Pages\GroupsController;
use App\Http\Controllers\Pages\HomeController;
use App\Http\Controllers\Pages\LeaderboardsController;
use App\Http\Controllers\Pages\MatchDetailsController;
use App\Http\Controllers\Pages\MatchesController;
use App\Http\Controllers\Pages\PredictionDetailsController;
use App\Http\Controllers\Pages\PredictionsController;
use App\Http\Controllers\Pages\ScoringGuideController;
use App\Http\Controllers\Pages\TeamDetailsController;
use App\Http\Controllers\Predictions\StoreMatchPredictionController;
use App\Http\Controllers\Socialite\CallbackController;
use App\Http\Controllers\Socialite\RedirectController;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');
Route::get('/matches', MatchesController::class)->name('matches');
Route::get('/matches/{fixture}', MatchDetailsController::class)->name('matches.show');
Route::get('/teams/{team}', TeamDetailsController::class)->name('teams.show');
Route::get('/groups', GroupsController::class)->name('groups');
Route::get('/predictions', PredictionsController::class)->name('predictions');
Route::get('/scoring', ScoringGuideController::class)->name('scoring');
Route::get('/contact', ContactController::class)->name('contact');
Route::get('/auth/{provider}/redirect', RedirectController::class)
    ->middleware('throttle:social-auth')
    ->name('auth.redirect');
Route::get('/auth/{provider}/callback', CallbackController::class)
    ->middleware('throttle:social-auth')
    ->name('auth.callback');

Route::middleware('auth')->group(function () {
    Route::get('/leaderboards', LeaderboardsController::class)->name('leaderboards');

    Route::get('/leagues/create', CreateLeaguePageController::class)->name('leagues.create');
    Route::get('/leagues/join', JoinLeaguePageController::class)->name('leagues.join');
    Route::get('/leagues/{scoreboard}', ShowLeagueController::class)->name('leagues.show');
    Route::get('/leagues/{scoreboard}/settings', ShowLeagueSettingsController::class)->name('leagues.settings');
    Route::get('/leagues/{scoreboard}/members', ShowLeagueMembersController::class)->name('leagues.members');
    Route::post('/leagues', StoreLeagueController::class)->name('leagues.store');
    Route::post('/leagues/join', JoinLeagueController::class)->name('leagues.join.store');

    Route::get('/predictions/{fixture}/ai', PredictionDetailsController::class)
        ->defaults('predictionMode', 'ai')
        ->name('predictions.ai.show');
    Route::get('/predictions/{fixture}/my-prediction', PredictionDetailsController::class)
        ->defaults('predictionMode', 'mine')
        ->name('predictions.mine.show');

    Route::post('/matches/{fixture}/prediction', StoreMatchPredictionController::class)
        ->middleware('throttle:prediction-store')
        ->name('matches.prediction.store');

    Route::post('/feedback', StoreFeedbackController::class)
        ->middleware('throttle:feedback-store')
        ->name('feedback.store');

    Route::middleware('throttle:league-manage')->group(function () {
        Route::post('/leagues/{scoreboard}/refresh-code', RefreshLeagueCodeController::class)
            ->name('leagues.refresh-code');
        Route::post('/leagues/{scoreboard}/owner/{member}', TransferLeagueOwnershipController::class)
            ->name('leagues.owner.transfer');
        Route::post('/leagues/{scoreboard}/ai-participant', AddAiParticipantController::class)
            ->name('leagues.ai-participant.store');
        Route::delete('/leagues/{scoreboard}/ai-participant', RemoveAiParticipantController::class)
            ->name('leagues.ai-participant.destroy');
        Route::patch('/leagues/{scoreboard}', UpdateLeagueController::class)->name('leagues.update');
        Route::delete('/leagues/{scoreboard}/leave', LeaveLeagueController::class)->name('leagues.leave');
        Route::delete('/leagues/{scoreboard}', DeleteLeagueController::class)->name('leagues.destroy');
        Route::delete('/leagues/{scoreboard}/members/{member}', RemoveLeagueMemberController::class)
            ->name('leagues.members.destroy');
    });
});

require __DIR__.'/settings.php';
