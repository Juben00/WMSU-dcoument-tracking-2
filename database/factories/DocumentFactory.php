<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Document>
 */
class DocumentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'order_number' => $this->faker->unique()->numerify('DOC-#####'),
            'subject' => $this->faker->sentence(),
            'description' => $this->faker->paragraph(),
            'status' => $this->faker->randomElement(['draft', 'pending', 'in_review', 'approved', 'rejected', 'returned', 'cancelled']),
            'document_type' => $this->faker->randomElement(['memo', 'letter', 'report', 'proposal', 'other']),
            'is_public' => $this->faker->boolean(20),
            'public_token' => $this->faker->uuid(),
            'barcode_path' => null,
            'barcode_value' => $this->faker->numerify('BRC-#####'),
            'owner_id' => User::factory(),
            'department_id' => null,
            'through_user_ids' => null,
            'created_at' => $this->faker->dateTimeBetween('-30 days', 'now'),
            'updated_at' => $this->faker->dateTimeBetween('-30 days', 'now'),
        ];
    }
}
