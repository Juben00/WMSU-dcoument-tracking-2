import { FormEventHandler } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import AuthLayout from '@/layouts/auth-layout';
import { LoaderCircle, Check } from 'lucide-react';

interface FirstTimePasswordForm {
    password: string;
    password_confirmation: string;
}

export default function FirstTimePassword() {
    const { data, setData, post, processing, errors, reset } = useForm<Required<FirstTimePasswordForm>>({
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.update'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout title="WMSU" description="Document Management and Tracking System">
            <Head title="Change Password" />

            <div className="w-full max-w-md mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome to WMSU DMTS</h1>
                    <p className="text-gray-600 dark:text-gray-300">Please change your password to continue</p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-gray-700 dark:text-gray-200">
                            New Password <span className="text-red-600 dark:text-red-400">*</span>
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className={`${errors.password ? "border-red-500 dark:border-red-400" : ""} bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white`}
                            placeholder="Enter your new password"
                            required
                            autoFocus
                        />
                        {errors.password && (
                            <InputError message={errors.password} />
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password_confirmation" className="text-gray-700 dark:text-gray-200">
                            Confirm New Password <span className="text-red-600 dark:text-red-400">*</span>
                        </Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            className={`${errors.password_confirmation ? "border-red-500 dark:border-red-400" : ""} bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white`}
                            placeholder="Confirm your new password"
                            required
                        />
                        {errors.password_confirmation && (
                            <InputError message={errors.password_confirmation} />
                        )}
                    </div>

                    {/* Password Requirements */}
                    {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3 dark:bg-blue-900/20 dark:border-blue-800">
                        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">Password Requirements:</h4>
                        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                                At least 8 characters
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                                At least one uppercase letter
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                                At least one lowercase letter
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                                At least one number
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                                At least one special character
                            </li>
                        </ul>
                    </div> */}

                    <Button type="submit" className="w-full" disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                        Change Password & Continue
                    </Button>
                </form>
            </div>
        </AuthLayout>
    );
}
