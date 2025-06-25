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
        Departments::create([
            'name' => 'Office of the President',
            'description' => 'Office of the President',
            'type' => 'office',
        ]);

        Departments::create([
            'name' => 'Office of the Vice President',
            'description' => 'Office of the Vice President',
            'type' => 'office',
        ]);

        Departments::create([
            'name' => 'College of Computing Studies',
            'description' => 'College of Computing Studies',
            'type' => 'college',
        ]);
    }
}
