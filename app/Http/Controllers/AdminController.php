<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Office;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class AdminController extends Controller
{
    public function index()
    {
        $admins = User::where('role', 'admin')->with('office')->get();
        $offices = Office::all();

        return Inertia::render('Admins/admins', [
            'admins' => $admins,
            'offices' => $offices
        ]);
    }

    public function user(){
        $users = User::where('role', 'user')->get();

        return Inertia::render('Admins/user', [
            'users' => $users
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'suffix' => ['nullable', 'string', 'max:255'],
            'gender' => ['required', 'string', 'in:Male,Female'],
            'position' => ['required', 'string', 'max:255'],
            'office_id' => ['nullable', 'exists:offices,id'],
            'role' => ['required', 'string', 'in:admin,user'],
            'avatar' => ['nullable', 'image', 'max:2048'], // 2MB max
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $avatarPath = null;
        if ($request->hasFile('avatar')) {
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
        }

        $user = User::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'middle_name' => $request->middle_name,
            'suffix' => $request->suffix,
            'gender' => $request->gender,
            'position' => $request->position,
            'office_id' => $request->office_id,
            'role' => $request->role,
            'avatar' => $avatarPath,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        return redirect()->route('admins.index');
    }

    public function toggleStatus(User $admin)
    {
        $admin->update([
            'is_active' => !$admin->is_active
        ]);

        return redirect()->route('admins.index');
    }

    public function destroy(User $admin)
    {
        $admin->delete();

        return redirect()->route('admins.index');
    }

    public function update(Request $request, User $admin)
    {
        $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'suffix' => ['nullable', 'string', 'max:255'],
            'gender' => ['required', 'string', 'in:Male,Female'],
            'position' => ['required', 'string', 'max:255'],
            'office_id' => ['required', 'exists:offices,id'],
            'avatar' => ['nullable', 'image', 'max:2048'], // 2MB max
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $admin->id],
        ]);

        $data = $request->except('avatar');

        if ($request->hasFile('avatar')) {
            // Delete old avatar if exists
            if ($admin->avatar) {
                Storage::disk('public')->delete($admin->avatar);
            }
            $data['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        $admin->update($data);

        return redirect()->route('admins.index');
    }
}
