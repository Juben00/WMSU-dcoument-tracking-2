<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Office;

class OfficeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Office::create([
            'name' => 'Office 1',
            'description' => 'Office 1 description',
        ]);

        Office::create([
            'name' => 'Office 2',
            'description' => 'Office 2 description',
        ]);
    }
}
