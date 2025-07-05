import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

type RegisterForm = {
    first_name: string;
    last_name: string;
    middle_name: string;
    suffix: string;
    gender: string;
    position: string;
    department: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm<RegisterForm>({
        first_name: '',
        last_name: '',
        middle_name: '',
        suffix: '',
        gender: '',
        position: '',
        department: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout title="Create an account" description="Enter your details below to create your account">
            <Head title="Register" />
            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="first_name" className="text-gray-700 dark:text-gray-200">First Name</Label>
                        <Input
                            id="first_name"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="given-name"
                            value={data.first_name}
                            onChange={(e) => setData('first_name', e.target.value)}
                            disabled={processing}
                            placeholder="First name"
                            className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                        />
                        <InputError message={errors.first_name} className="mt-2" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="last_name" className="text-gray-700 dark:text-gray-200">Last Name</Label>
                        <Input
                            id="last_name"
                            type="text"
                            required
                            tabIndex={2}
                            autoComplete="family-name"
                            value={data.last_name}
                            onChange={(e) => setData('last_name', e.target.value)}
                            disabled={processing}
                            placeholder="Last name"
                            className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                        />
                        <InputError message={errors.last_name} className="mt-2" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="middle_name" className="text-gray-700 dark:text-gray-200">Middle Name</Label>
                        <Input
                            id="middle_name"
                            type="text"
                            tabIndex={3}
                            autoComplete="additional-name"
                            value={data.middle_name}
                            onChange={(e) => setData('middle_name', e.target.value)}
                            disabled={processing}
                            placeholder="Middle name"
                            className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                        />
                        <InputError message={errors.middle_name} className="mt-2" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="suffix" className="text-gray-700 dark:text-gray-200">Suffix</Label>
                        <Input
                            id="suffix"
                            type="text"
                            tabIndex={4}
                            autoComplete="honorific-suffix"
                            value={data.suffix}
                            onChange={(e) => setData('suffix', e.target.value)}
                            disabled={processing}
                            placeholder="Suffix (e.g. Jr., Sr., III)"
                            className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                        />
                        <InputError message={errors.suffix} className="mt-2" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="gender" className="text-gray-700 dark:text-gray-200">Gender</Label>
                        <select
                            id="gender"
                            required
                            tabIndex={5}
                            value={data.gender}
                            onChange={(e) => setData('gender', e.target.value)}
                            disabled={processing}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50  dark:bg-gray-700  dark:border-gray-600 text-gray-900 dark:text-white"
                        >
                            <option value="">Select gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                        <InputError message={errors.gender} className="mt-2" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="position" className="text-gray-700 dark:text-gray-200">Position</Label>
                        <Input
                            id="position"
                            type="text"
                            required
                            tabIndex={6}
                            value={data.position}
                            onChange={(e) => setData('position', e.target.value)}
                            disabled={processing}
                            placeholder="Position"
                            className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                        />
                        <InputError message={errors.position} className="mt-2" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="department" className="text-gray-700 dark:text-gray-200">Department</Label>
                        <Input
                            id="department"
                            type="text"
                            required
                            tabIndex={7}
                            value={data.department}
                            onChange={(e) => setData('department', e.target.value)}
                            disabled={processing}
                            placeholder="Department"
                            className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                        />
                        <InputError message={errors.department} className="mt-2" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email" className="text-gray-700 dark:text-gray-200">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            tabIndex={8}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={processing}
                            placeholder="Email address"
                            className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password" className="text-gray-700 dark:text-gray-200">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={9}
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            disabled={processing}
                            placeholder="Password"
                            className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                        />
                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation" className="text-gray-700 dark:text-gray-200">Confirm Password</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            required
                            tabIndex={10}
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            disabled={processing}
                            placeholder="Confirm password"
                            className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                        />
                        <InputError message={errors.password_confirmation} className="mt-2" />
                    </div>
                </div>

                <Button type="submit" disabled={processing}>
                    {processing ? (
                        <>
                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            Creating account...
                        </>
                    ) : (
                        'Create account'
                    )}
                </Button>

                <div className="text-center text-sm text-gray-600 dark:text-gray-300">
                    Already have an account?{' '}
                    <TextLink href={route('login')} className="font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white">
                        Sign in
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
