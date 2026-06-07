<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AiUserSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'ai@mondialiq.local'],
            [
                'name' => 'MondialiQ AI',
                'password' => Hash::make(Str::random(32)),
                'is_system_user' => true,
                'email_verified_at' => now(),
            ]
        );

        if (! $user->is_system_user) {
            $user->forceFill(['is_system_user' => true])->save();
        }
    }
}
