<?php

use App\Http\Controllers\Api\LiveFixturesController;
use Illuminate\Support\Facades\Route;

Route::get('/live-fixtures', LiveFixturesController::class)
    ->middleware(['web', 'auth'])
    ->name('api.live-fixtures');
