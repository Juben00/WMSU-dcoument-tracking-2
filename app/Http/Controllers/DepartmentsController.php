<?php

namespace App\Http\Controllers;

use App\Models\Departments;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

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
            'description' => 'nullable|string|max:1000',
            'type' => 'required|string|in:office,college',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        Departments::create($request->all());

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
            'description' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        $department->update($request->all());

        return redirect()->route('departments.index')
            ->with('success', 'Department updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Departments $department)
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

            return back()->with('success', 'Department deleted successfully.');
        } catch (\Exception $e) {
            return back()->withErrors([
                'department' => 'Failed to delete department. Please try again.'
            ]);
        }
    }
}
