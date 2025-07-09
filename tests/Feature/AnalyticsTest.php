<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Document;
use App\Models\UserActivityLog;
use App\Models\DocumentActivityLog;
use App\Models\Departments;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Carbon\Carbon;

class AnalyticsTest extends TestCase
{
    use RefreshDatabase;

    public function test_superadmin_can_access_analytics_page()
    {
        $superadmin = User::factory()->create([
            'role' => 'superadmin',
        ]);

        $response = $this->actingAs($superadmin)->get('/Admin/analytics');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Admins/Analytics'));
    }

    public function test_regular_user_cannot_access_analytics_page()
    {
        $user = User::factory()->create([
            'role' => 'user',
        ]);

        $response = $this->actingAs($user)->get('/Admin/analytics');

        // The middleware redirects instead of returning 403
        $response->assertStatus(302);
    }

    public function test_analytics_page_returns_correct_data_structure()
    {
        $superadmin = User::factory()->create([
            'role' => 'superadmin',
        ]);

        // Create some test data
        $department = Departments::factory()->create();
        $user = User::factory()->create(['department_id' => $department->id]);
        $document = Document::factory()->create(['owner_id' => $user->id]);

        UserActivityLog::factory()->create([
            'user_id' => $user->id,
            'action' => 'login',
            'created_at' => Carbon::now(),
        ]);

        $response = $this->actingAs($superadmin)->get('/Admin/analytics');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->has('userAnalytics') &&
            $page->has('documentAnalytics') &&
            $page->has('departmentAnalytics') &&
            $page->has('activityAnalytics') &&
            $page->has('processingTimeAnalytics') &&
            $page->has('filters')
        );
    }

    public function test_analytics_with_date_filters()
    {
        $superadmin = User::factory()->create([
            'role' => 'superadmin',
        ]);

        $dateFrom = Carbon::now()->subDays(7)->format('Y-m-d');
        $dateTo = Carbon::now()->format('Y-m-d');

        $response = $this->actingAs($superadmin)
            ->get("/Admin/analytics?date_from={$dateFrom}&date_to={$dateTo}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->where('filters.date_from', $dateFrom) &&
            $page->where('filters.date_to', $dateTo)
        );
    }

    public function test_generate_report_endpoint()
    {
        $superadmin = User::factory()->create([
            'role' => 'superadmin',
        ]);

        $response = $this->actingAs($superadmin)
            ->post('/Admin/analytics/reports', [
                'report_type' => 'user_activity',
                'date_from' => Carbon::now()->subDays(30)->format('Y-m-d'),
                'date_to' => Carbon::now()->format('Y-m-d'),
                'format' => 'json',
            ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'report_type',
            'period',
        ]);
    }

    public function test_generate_report_validation()
    {
        $superadmin = User::factory()->create([
            'role' => 'superadmin',
        ]);

        $response = $this->actingAs($superadmin)
            ->post('/Admin/analytics/reports', [
                'report_type' => 'invalid_type',
                'date_from' => 'invalid_date',
                'date_to' => 'invalid_date',
                'format' => 'invalid_format',
            ]);

        // The validation redirects instead of returning 422
        $response->assertStatus(302);
    }
}
