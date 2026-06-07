<?php

use App\Enums\PredictionTypes;
use App\Models\Prediction;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        $aiUser = User::where('email', 'ai@mondialiq.local')->first();

        if ($aiUser === null) {
            $aiUser = User::create([
                'name' => 'MondialiQ AI',
                'email' => 'ai@mondialiq.local',
                'password' => Hash::make(Str::random(32)),
                'is_system_user' => true,
                'email_verified_at' => now(),
            ]);
        } else {
            $aiUser->forceFill(['is_system_user' => true])->save();
        }

        Prediction::query()
            ->where('source', PredictionTypes::Ai->value)
            ->whereNull('user_id')
            ->update(['user_id' => $aiUser->id]);
    }

    public function down(): void
    {
        $aiUser = User::where('email', 'ai@mondialiq.local')->first();

        if ($aiUser === null) {
            return;
        }

        Prediction::query()
            ->where('source', PredictionTypes::Ai->value)
            ->where('user_id', $aiUser->id)
            ->update(['user_id' => null]);
    }
};
