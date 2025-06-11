<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        User::factory()->create([
            'first_name' => 'Test',
            'last_name' => 'User',
            'middle_name' => 'Middle',
            'suffix' => 'Suffix',
            'gender' => 'Male',
            'position' => 'Position',
            'office_id' => null,
            'role' => 'superadmin',
            'avatar' => 'https://ui-avatars.com/api/?name=Test+User',
            'email' => 'test@example.com',
            'password' => Hash::make('superadmin'),
        ]);
    }
}
