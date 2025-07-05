<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Departments;

class DepartmentsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1
        Departments::create([
            'name' => 'Office of the President',
            'code' => 'OP',
            'description' => 'Office of the President',
            'type' => 'office',
        ]);

        // 2
        Departments::create([
            'name' => 'Office of the Vice President',
            'code' => 'OVP',
            'description' => 'Office of the Vice President',
            'type' => 'office',
        ]);

        // 3
        Departments::create([
            'name' => 'Office of the Vice President for Research and Development',
            'code' => 'OVP-R&D',
            'description' => 'Office of the Vice President for Research and Development',
            'type' => 'office',
        ]);

        // 4
        Departments::create([
            'name' => 'Office of the Vice President for Academic Affairs',
            'code' => 'OVP-AA',
            'description' => 'Office of the Vice President for Academic Affairs',
            'type' => 'office',
        ]);

        // 5
        Departments::create([
            'name' => 'Office of the Vice President for Finance',
            'code' => 'OVP-Finance',
            'description' => 'Office of the Vice President for Finance',
            'type' => 'office',
        ]);

        // 6
        Departments::create([
            'name' => 'College of Computing Studies',
            'code' => 'CCS',
            'description' => 'College of Computing Studies',
            'type' => 'college',
        ]);
    }
}
