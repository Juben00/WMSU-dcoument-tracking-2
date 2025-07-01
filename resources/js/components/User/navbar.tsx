import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import WmsuLogo from '../WmsuLogo';
import { NavMain } from '../nav-main';
import { usePage } from '@inertiajs/react';
import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { FileText, Users, User, LogOut, Building } from 'lucide-react';

interface AuthUser {
    role?: string;
}

interface NavItem {
    label: string;
    href: string;
    method?: string;
    icon?: React.ReactNode;
}

interface PageProps extends InertiaPageProps {
    auth: {
        user?: AuthUser;
    };
}

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    const page = usePage<PageProps>();
    const { auth } = page.props;
    const role = auth?.user?.role || 'user';
    const currentUrl = page.url;

    const NavItems: NavItem[] = [
        {
            label: 'Dashboard',
            href: '/dashboard',
            icon: <FileText className="w-4 h-4" />,
        },
        {
            label: 'Documents',
            href: '/documents',
            icon: <FileText className="w-4 h-4" />,
        },
        {
            label: 'Profile',
            href: '/profile',
            icon: <User className="w-4 h-4" />,
        },
        {
            label: 'Logout',
            href: route('logout'),
            method: 'post',
            icon: <LogOut className="w-4 h-4" />,
        },
    ];

    const AdminNavItems: NavItem[] = [
        {
            label: 'Departments',
            href: '/departments',
            icon: <Building className="w-4 h-4" />,
        },
        ...NavItems,
    ];

    const currentNavItems = role === 'admin' ? AdminNavItems : NavItems;

    return (
        <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo and Title */}
                    <div className="flex items-center">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-4 hover:opacity-80 transition-all duration-200 group"
                        >
                            <div className="rounded-xl p-2 transition-all duration-200">
                                <WmsuLogo className="h-12 w-12 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-xl tracking-wide text-gray-900">WMSU DMTS</span>
                                <span className="text-sm text-gray-600 font-medium">Document Management</span>
                            </div>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-2">
                        {currentNavItems.map((item, index) => {
                            const isActive = currentUrl === item.href || (item.href !== route('logout') && currentUrl.startsWith(item.href));
                            const isLogout = item.label === 'Logout';

                            return (
                                <Link
                                    key={index}
                                    href={item.href}
                                    {...(item.method ? { method: item.method as any } : {})}
                                    className={`flex items-center gap-2 px-2 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${isLogout
                                        ? 'text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl transform hover:scale-105'
                                        : isActive
                                            ? 'text-red-700 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 shadow-sm'
                                            : 'text-gray-700 hover:text-red-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 border border-transparent hover:border-red-200'
                                        }`}
                                >
                                    {item.icon}
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="p-3 rounded-xl text-gray-600 hover:text-red-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200"
                            aria-expanded={menuOpen}
                            aria-controls="mobile-menu"
                            aria-label="Toggle menu"
                        >
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                {menuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div
                id="mobile-menu"
                className={`md:hidden transition-all duration-300 ease-in-out ${menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    } overflow-hidden bg-white border-t border-gray-200`}
            >
                <div className="px-4 py-6 space-y-3">
                    {currentNavItems.map((item, index) => {
                        const isActive = currentUrl === item.href || (item.href !== route('logout') && currentUrl.startsWith(item.href));
                        const isLogout = item.label === 'Logout';

                        return (
                            <Link
                                key={index}
                                href={item.href}
                                {...(item.method ? { method: item.method as any } : {})}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold transition-all duration-200 ${isLogout
                                    ? 'text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg'
                                    : isActive
                                        ? 'text-red-700 bg-gradient-to-r from-red-50 to-red-100 border border-red-200'
                                        : 'text-gray-700 hover:text-red-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100'
                                    }`}
                            >
                                {item.icon}
                                {item.label}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
