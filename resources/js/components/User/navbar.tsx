import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import WmsuLogo from '../WmsuLogo';
import { NavMain } from '../nav-main';
import { usePage } from '@inertiajs/react';
import { PageProps as InertiaPageProps } from '@inertiajs/core';

interface AuthUser {
    role?: string;
}

interface PageProps extends InertiaPageProps {
    auth: {
        user?: AuthUser;
    };
}

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    const { auth } = usePage<PageProps>().props;
    const role = auth?.user?.role || 'user';

    const NavItems = [
        {
            label: 'Dashboard',
            href: '/dashboard',
        },
        {
            label: 'Documents',
            href: '/documents',
        },
        {
            label: 'Profile',
            href: '/profile',
        },
        {
            label: 'Logout',
            href: '/logout',
            method: 'post',
        },
    ];

    const AdminNavItems = [
        {
            label: 'Offices',
            href: '/offices',
        },
        ...NavItems,
    ];

    const currentNavItems = role === 'admin' ? AdminNavItems : NavItems;

    return (
        <nav className="shadow-md bg-white sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo and Title */}
                    <div className="flex items-center">
                        <Link href="/dashboard" className="flex items-center hover:opacity-80 transition-opacity">
                            <WmsuLogo className="h-10 w-10 mr-3" />
                            <span className="font-bold text-xl tracking-wide text-gray-800">WMSU DMTS</span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex space-x-2 items-center">
                        {currentNavItems.map((item, index) => (
                            <Link
                                key={index}
                                href={item.href}
                                method={item.method as any}
                                className={`px-3 py-2 rounded-md text-sm font-medium ${item.label === 'Logout'
                                    ? 'text-white bg-red-700 hover:bg-red-800'
                                    : 'text-gray-600 hover:bg-red-50 hover:text-red-700'
                                    } transition-colors duration-200`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="p-2 rounded-md text-gray-600 hover:text-red-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500"
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
                    } overflow-hidden`}
            >
                <div className="px-2 pt-2 pb-3 space-y-1 bg-white shadow-lg">
                    {currentNavItems.map((item, index) => (
                        <Link
                            key={index}
                            href={item.href}
                            method={item.method as any}
                            className={`block px-3 py-2 rounded-md text-base font-medium ${item.label === 'Logout'
                                ? 'text-white bg-red-700 hover:bg-red-800'
                                : 'text-gray-600 hover:bg-red-50 hover:text-red-700'
                                } transition-colors duration-200`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
