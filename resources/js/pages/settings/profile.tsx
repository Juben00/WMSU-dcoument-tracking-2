import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { LoaderCircle } from 'lucide-react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: '/settings/profile',
    },
];

type ProfileForm = {
    first_name: string;
    last_name: string;
    middle_name: string;
    suffix: string;
    gender: string;
    position: string;
    department: string;
    email: string;
};

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth } = usePage<SharedData>().props;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm<ProfileForm>({
        first_name: auth.user.first_name,
        last_name: auth.user.last_name,
        middle_name: auth.user.middle_name || '',
        suffix: auth.user.suffix || '',
        gender: auth.user.gender,
        position: auth.user.position,
        department: auth.user.department,
        email: auth.user.email,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('profile.update'), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Profile information" description="Update your profile information" />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="first_name">First Name</Label>
                            <Input
                                id="first_name"
                                className="mt-1 block w-full"
                                value={data.first_name}
                                onChange={(e) => setData('first_name', e.target.value)}
                                required
                                autoComplete="given-name"
                                placeholder="First name"
                            />
                            <InputError className="mt-2" message={errors.first_name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="last_name">Last Name</Label>
                            <Input
                                id="last_name"
                                className="mt-1 block w-full"
                                value={data.last_name}
                                onChange={(e) => setData('last_name', e.target.value)}
                                required
                                autoComplete="family-name"
                                placeholder="Last name"
                            />
                            <InputError className="mt-2" message={errors.last_name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="middle_name">Middle Name</Label>
                            <Input
                                id="middle_name"
                                className="mt-1 block w-full"
                                value={data.middle_name}
                                onChange={(e) => setData('middle_name', e.target.value)}
                                autoComplete="additional-name"
                                placeholder="Middle name"
                            />
                            <InputError className="mt-2" message={errors.middle_name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="suffix">Suffix</Label>
                            <Input
                                id="suffix"
                                className="mt-1 block w-full"
                                value={data.suffix}
                                onChange={(e) => setData('suffix', e.target.value)}
                                autoComplete="honorific-suffix"
                                placeholder="Suffix (e.g. Jr., Sr., III)"
                            />
                            <InputError className="mt-2" message={errors.suffix} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="gender">Gender</Label>
                            <select
                                id="gender"
                                required
                                value={data.gender}
                                onChange={(e) => setData('gender', e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="">Select gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                            <InputError className="mt-2" message={errors.gender} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="position">Position</Label>
                            <Input
                                id="position"
                                className="mt-1 block w-full"
                                value={data.position}
                                onChange={(e) => setData('position', e.target.value)}
                                required
                                placeholder="Position"
                            />
                            <InputError className="mt-2" message={errors.position} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="department">Department</Label>
                            <Input
                                id="department"
                                className="mt-1 block w-full"
                                value={data.department}
                                onChange={(e) => setData('department', e.target.value)}
                                required
                                placeholder="Department"
                            />
                            <InputError className="mt-2" message={errors.department} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email address</Label>
                            <Input
                                id="email"
                                type="email"
                                className="mt-1 block w-full"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="username"
                                placeholder="Email address"
                            />
                            <InputError className="mt-2" message={errors.email} />
                        </div>

                        {mustVerifyEmail && auth.user.email_verified_at === null && (
                            <div>
                                <p className="-mt-4 text-sm text-muted-foreground">
                                    Your email address is unverified.{' '}
                                    <Link
                                        href={route('verification.send')}
                                        method="post"
                                        as="button"
                                        className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                    >
                                        Click here to resend the verification email.
                                    </Link>
                                </p>

                                {status === 'verification-link-sent' && (
                                    <div className="mt-2 text-sm font-medium text-green-600">
                                        A new verification link has been sent to your email address.
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            <Button type="submit" disabled={processing}>
                                {processing ? (
                                    <>
                                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save'
                                )}
                            </Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-muted-foreground">Saved.</p>
                            </Transition>
                        </div>
                    </form>
                </div>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
