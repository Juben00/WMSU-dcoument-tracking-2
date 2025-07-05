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
        // Superadmin
        User::factory()->create([
            'first_name' => 'Superadmin',
            'last_name' => 'User',
            'middle_name' => '',
            'suffix' => 'Suffix',
            'gender' => 'Male',
            'role' => 'superadmin',
            'department_id' => null,
            'position' => 'Superadmin',
            'avatar' => 'https://ui-avatars.com/api/?name=Superadmin+User',
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);

        // OP
        User::factory()->create([
            'first_name' => 'Test',
            'last_name' => 'User',
            'middle_name' => 'Middle',
            'suffix' => 'Suffix',
            'gender' => 'Male',
            'position' => 'University President',
            'department_id' => 1,
            'role' => 'admin',
            'avatar' => 'https://ui-avatars.com/api/?name=Test+User',
            'email' => 'joevinansoc870@gmail.com',
            'password' => Hash::make('password'),
        ]);

        // OVP
        User::factory()->create([
            'first_name' => 'Joevin',
            'last_name' => 'Ansoc',
            'middle_name' => '',
            'suffix' => 'Suffix',
            'gender' => 'Male',
            'position' => 'University Vice President',
            'department_id' => 2,
            'role' => 'admin',
            'avatar' => 'https://ui-avatars.com/api/?name=Joe+Doe',
            'email' => 'joevinansoc871@gmail.com',
            'password' => Hash::make('password'),
        ]);

        // OVP-R&D
        User::factory()->create([
            'first_name' => 'Jorica',
            'last_name' => 'Alejandro',
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

        // OVP-AA
        User::factory()->create([
            'first_name' => 'Joreen',
            'last_name' => 'Jeay',
            'middle_name' => '',
            'suffix' => 'Suffix',
            'gender' => 'Female',
            'position' => 'University Vice President for Academic Affairs',
            'department_id' => 4,
            'role' => 'admin',
            'avatar' => 'https://ui-avatars.com/api/?name=Joe+Doe',
            'email' => 'joevinansoc873@gmail.com',
            'password' => Hash::make('password'),
        ]);

        // OVP-Finance
        User::factory()->create([
            'first_name' => 'Joev',
            'last_name' => 'Ansoc',
            'middle_name' => '',
            'suffix' => 'Suffix',
            'gender' => 'Male',
            'position' => 'University Vice President for Finance',
            'department_id' => 5,
            'role' => 'admin',
            'avatar' => 'https://ui-avatars.com/api/?name=Joe+Doe',
            'email' => 'joevinansoc874@gmail.com',
            'password' => Hash::make('password'),
        ]);

        // CCS
        User::factory()->create([
            'first_name' => 'Joevin',
            'last_name' => 'Ansoc',
            'middle_name' => '',
            'suffix' => 'Suffix',
            'gender' => 'Male',
            'position' => 'Dean',
            'department_id' => 6,
            'role' => 'admin',
            'avatar' => 'https://ui-avatars.com/api/?name=Joe+Doe',
            'email' => 'joevinansoc875@gmail.com',
            'password' => Hash::make('password'),
        ]);
    }
}
