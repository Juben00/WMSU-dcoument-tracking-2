<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;

class UpdateExistingUsersPasswordChangedSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Update existing admin, user, and receiver accounts to have their password marked as changed
        // This prevents existing users from being forced to change their password
        // Superadmin accounts are excluded from this requirement
        User::whereIn('role', ['admin', 'user', 'receiver'])
            ->whereNull('password_changed_at')
            ->update([
                'password_changed_at' => now()
            ]);

        $this->command->info('Updated existing admin, user, and receiver accounts password_changed_at field.');
    }
}
