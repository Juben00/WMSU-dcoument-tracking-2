import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    first_name: string;
    last_name: string;
    middle_name: string | null;
    suffix: string | null;
    gender: string;
    position: string;
    department: Departments | null;
    role: string;
    avatar?: string;
    email: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    is_active: boolean;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Admin {
    id: number;
    first_name: string;
    last_name: string;
    middle_name: string | null;
    suffix: string | null;
    gender: string;
    position: string;
    department: Departments | null;
    email: string;
    is_active: boolean;
    created_at: string;
    avatar: string | null;
}

export interface Departments {
    id: number;
    name: string;
    description: string | null;
    type: 'office' | 'college';
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}
