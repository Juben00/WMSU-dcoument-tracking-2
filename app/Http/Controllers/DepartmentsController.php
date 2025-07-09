<?php

namespace App\Http\Controllers;

use App\Models\Departments;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use App\Notifications\InAppNotification;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class DepartmentsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function departments()
    {
        $departments = Departments::all();
        return Inertia::render('Admins/Departments', [
            'departments' => $departments,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Departments/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:departments',
            'code' => 'required|string|max:255|unique:departments',
            'description' => 'nullable|string|max:1000',
            'type' => 'required|string|in:office,college',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        Departments::create($request->all());

        // Log department creation
        \App\Models\UserActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'department_created',
            'description' => 'Created department: ' . $request->name,
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);

        // Notify all admins about the new department
        $admins = User::where('role', 'superadmin')->get();
        foreach ($admins as $admin) {
            $admin->notify(new InAppNotification('A new department has been created.', ['department_name' => $request->name]));
        }

        return redirect()->route('departments.index')
            ->with('success', 'Department created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Departments $department)
    {
        return Inertia::render('Departments/show', compact('department'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Departments $department)
    {
        return Inertia::render('Departments/edit', compact('department'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Departments $department)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:departments,name,' . $department->id,
            'code' => 'required|string|max:255|unique:departments,code,' . $department->id,
            'description' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        $department->update($request->all());

        // Log department update
        \App\Models\UserActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'department_updated',
            'description' => 'Updated department: ' . $department->name,
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);

        // Notify all admins about the department update
        $admins = User::where('role', 'superadmin')->get();
        foreach ($admins as $admin) {
            $admin->notify(new InAppNotification('A department has been updated.', ['department_name' => $department->name]));
        }

        return redirect()->route('departments.index')->with('success', 'Department updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Departments $department)
    {
        try {
            // Check if there are any users associated with this department
            $userCount = $department->users()->count();

            if ($userCount > 0) {
                return back()->withErrors([
                    'department' => "Cannot delete department '{$department->name}' because it has {$userCount} user(s) associated with it. Please reassign or delete the users first."
                ]);
            }

            $department->delete();

            // Log department deletion
            \App\Models\UserActivityLog::create([
                'user_id' => Auth::id(),
                'action' => 'department_deleted',
                'description' => 'Deleted department: ' . $department->name,
                'ip_address' => $request->ip(),
                'created_at' => now(),
            ]);

            // Notify all admins about the department deletion
            $admins = User::where('role', 'superadmin')->get();
            foreach ($admins as $admin) {
                $admin->notify(new InAppNotification('A department has been deleted.', ['department_name' => $department->name]));
            }

            return back()->with('success', 'Department deleted successfully.');
        } catch (\Exception $e) {
            return back()->withErrors([
                'department' => 'Failed to delete department. Please try again.'
            ]);
        }
    }
}
