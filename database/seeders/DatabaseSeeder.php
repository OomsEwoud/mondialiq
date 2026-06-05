<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
Use Database\Seeders\RoleSeeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
        ]);
    }
}
