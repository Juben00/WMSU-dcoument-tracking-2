<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Departments;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;

class DepartmentDeletionTest extends TestCase
{
    use RefreshDatabase;

    public function test_superadmin_can_delete_department_without_users()
    {
        // Create a superadmin user
        $superadmin = User::factory()->create([
            'role' => 'superadmin',
            'department_id' => null
        ]);

        // Create a department
        $department = Departments::factory()->create();

        $this->actingAs($superadmin)
            ->delete(route('departments.destroy', $department->id))
            ->assertRedirect()
            ->assertSessionHas('success', 'Department deleted successfully.');

        $this->assertDatabaseMissing('departments', ['id' => $department->id]);
    }

    public function test_superadmin_cannot_delete_department_with_users()
    {
        // Create a superadmin user
        $superadmin = User::factory()->create([
            'role' => 'superadmin',
            'department_id' => null
        ]);

        // Create a department
        $department = Departments::factory()->create();

        // Create a user associated with the department
        $user = User::factory()->create([
            'department_id' => $department->id
        ]);

        $this->actingAs($superadmin)
            ->delete(route('departments.destroy', $department->id))
            ->assertRedirect()
            ->assertSessionHasErrors(['department']);

        $this->assertDatabaseHas('departments', ['id' => $department->id]);
    }

    public function test_non_superadmin_cannot_delete_department()
    {
        // Create a regular user
        $user = User::factory()->create([
            'role' => 'user'
        ]);

        // Create a department
        $department = Departments::factory()->create();

        $this->actingAs($user)
            ->delete(route('departments.destroy', $department->id))
            ->assertStatus(403);

        $this->assertDatabaseHas('departments', ['id' => $department->id]);
    }
}