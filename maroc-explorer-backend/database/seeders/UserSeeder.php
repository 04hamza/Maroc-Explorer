<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Admin',
            'email' => 'aitboubkerhamza18@gmail.com',
            'password' => bcrypt('password'),
        ]);
    }
}