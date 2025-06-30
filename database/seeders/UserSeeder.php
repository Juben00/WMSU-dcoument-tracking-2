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
            'department_id' => null,
            'role' => 'superadmin',
            'avatar' => 'https://ui-avatars.com/api/?name=Test+User',
            'email' => 'test@example.com',
            'password' => Hash::make('superadmin'),
        ]);

        User::factory()->create([
            'first_name' => 'Joevin',
            'last_name' => 'Ansoc',
            'middle_name' => '',
            'suffix' => 'Suffix',
            'gender' => 'Male',
            'position' => 'University President',
            'department_id' => 1,
            'role' => 'admin',
            'avatar' => 'https://ui-avatars.com/api/?name=Joe+Doe',
            'email' => 'joevinansoc870@gmail.com',
            'password' => Hash::make('password'),
        ]);

        User::factory()->create([
            'first_name' => 'Jorica',
            'last_name' => 'Alejandro',
            'middle_name' => '',
            'suffix' => 'Suffix',
            'gender' => 'Female',
            'position' => 'University Vice President',
            'department_id' => 2,
            'role' => 'admin',
            'avatar' => 'https://ui-avatars.com/api/?name=Joe+Doe',
            'email' => 'joevinansoc871@gmail.com',
            'password' => Hash::make('password'),
        ]);

        User::factory()->create([
            'first_name' => 'Joreen',
            'last_name' => 'Jeay',
            'middle_name' => '',
            'suffix' => 'Suffix',
            'gender' => 'Female',
            'position' => 'University Vice President for Research and Development',
            'department_id' => 3,
            'role' => 'admin',
            'avatar' => 'https://ui-avatars.com/api/?name=Joe+Doe',
            'email' => 'joevinansoc872@gmail.com',
            'password' => Hash::make('password'),
        ]);

        User::factory()->create([
            'first_name' => 'John',
            'last_name' => 'Doe',
            'middle_name' => '',
            'suffix' => 'Suffix',
            'gender' => 'Male',
            'position' => 'CCS Dean',
            'department_id' => 4,
            'role' => 'admin',
            'avatar' => 'https://ui-avatars.com/api/?name=Joe+Doe',
            'email' => 'joevinansoc873@gmail.com',
            'password' => Hash::make('password'),
        ]);
    }
}
