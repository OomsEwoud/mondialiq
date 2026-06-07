<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

#[Signature('make:super-admin')]
#[Description('Create a user and assign the super_admin role')]
class MakeSuperAdmin extends Command
{
    public function handle()
    {
        $name = $this->ask('Name');
        $email = $this->ask('Email');
        $password = $this->secret('Password');

        Role::firstOrCreate([
            'name' => 'super_admin',
            'guard_name' => 'web',
        ]);

        $user = User::firstOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => Hash::make($password),
            ],
        );

        if (! $user->wasRecentlyCreated) {
            $user->update([
                'name' => $name,
                'password' => Hash::make($password),
            ]);
        }

        $user->syncRoles(['super_admin']);

        $this->info("{$user->email} is now a super admin.");

        return self::SUCCESS;
    }
}
