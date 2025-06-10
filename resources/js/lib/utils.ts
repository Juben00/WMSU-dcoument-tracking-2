import { Admin, User } from '@/types';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getFullName(user: User | Admin) {
    const parts = [
        user.first_name,
        user.middle_name || '',
        user.last_name,
        user.suffix
    ].filter(Boolean);
    return parts.join(' ');
}