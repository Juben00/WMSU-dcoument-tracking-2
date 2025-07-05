import React, { useState, useEffect, useRef } from 'react';
import { Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import WmsuLogo from '../WmsuLogo';
import { NavMain } from '../nav-main';
import { usePage } from '@inertiajs/react';
import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { FileText, Users, User, LogOut, Building, Bell, XCircle, Inbox, LayoutGrid } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from "../ui/tooltip";
import AppearanceToggleDropdown from '../appearance-dropdown';

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
    notifications: any[];
}

interface NavbarProps {
    notifications?: any[];
}

const Navbar = ({ notifications = [] }: NavbarProps) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const page = usePage<PageProps>();
    const { auth } = page.props;
    const role = auth?.user?.role || 'user';
    const currentUrl = page.url;

    // Calculate unread notifications
    const unreadCount = notifications.filter(n => !n.read_at).length;

    // Handler to mark all as read and refetch notifications
    const handleMarkAllAsRead = () => {
        router.post(route('notifications.readAll'), {}, {
            onSuccess: () => {
                // refresh the entire page
                window.location.reload();
            }
        });
    };

    // Close notification dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setNotifOpen(false);
            }
        }
        if (notifOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [notifOpen]);

    // For closing mobile menu on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        }
        if (menuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [menuOpen]);

    const NavItems: NavItem[] = [
        {
            label: 'Dashboard',
            href: '/dashboard',
            icon: <LayoutGrid className="w-4 h-4" />,
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
        <nav className="bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 shadow-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center h-20 w-full">
                    {/* Left: Logo and Title */}
                    <div className="flex items-center flex-shrink-0">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-4 hover:opacity-80 transition-all duration-200 group"
                        >
                            <div className="rounded-xl p-2 transition-all duration-200">
                                <WmsuLogo className="h-12 w-12 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-xl tracking-wide text-gray-900 dark:text-gray-100">WMSU DMTS</span>
                                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Document Management</span>
                            </div>
                        </Link>
                    </div>
                    {/* Center: Theme Toggle */}
                    <div className="flex-1 flex justify-center">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm border border-gray-200 bg-white hover:bg-red-50 active:scale-95 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-red-900/20 hover:shadow-md">
                                    <AppearanceToggleDropdown className="w-full h-full flex items-center justify-center" />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>Toggle theme</TooltipContent>
                        </Tooltip>
                    </div>
                    {/* Right: Main Nav Items */}
                    <div className="hidden md:flex items-center gap-2 flex-shrink-0">
                        {/* Dashboard */}
                        {currentNavItems.filter(item => item.label === 'Dashboard').map((item) => {
                            const isActive = currentUrl === item.href || (item.href !== route('logout') && currentUrl.startsWith(item.href));
                            return (
                                <Tooltip key={item.label}>
                                    <TooltipTrigger asChild>
                                        <Link
                                            href={item.href}
                                            {...(item.method ? { method: item.method as any } : {})}
                                            aria-label={item.label}
                                            className={`flex items-center justify-center w-11 h-11 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm border ${isActive
                                                ? 'text-red-700 bg-red-50 border-red-200 ring-2 ring-red-500 dark:text-red-400 dark:bg-red-900/20 dark:border-red-700'
                                                : 'text-gray-700 bg-white border-gray-200 hover:text-red-700 hover:bg-red-50 hover:border-red-300 active:scale-95 dark:text-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:hover:text-red-400 dark:hover:bg-red-900/20 dark:hover:border-red-600'
                                                }`}
                                        >
                                            {item.icon}
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent>{item.label}</TooltipContent>
                                </Tooltip>
                            );
                        })}
                        {/* Department */}
                        {currentNavItems.filter(item => item.label === 'Departments').map((item) => {
                            const isActive = currentUrl === item.href || (item.href !== route('logout') && currentUrl.startsWith(item.href));
                            return (
                                <Tooltip key={item.label}>
                                    <TooltipTrigger asChild>
                                        <Link
                                            href={item.href}
                                            {...(item.method ? { method: item.method as any } : {})}
                                            aria-label={item.label}
                                            className={`flex items-center justify-center w-11 h-11 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm border ${isActive
                                                ? 'text-red-700 bg-red-50 border-red-200 ring-2 ring-red-500 dark:text-red-400 dark:bg-red-900/20 dark:border-red-700'
                                                : 'text-gray-700 bg-white border-gray-200 hover:text-red-700 hover:bg-red-50 hover:border-red-300 active:scale-95 dark:text-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:hover:text-red-400 dark:hover:bg-red-900/20 dark:hover:border-red-600'
                                                }`}
                                        >
                                            {item.icon}
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent>{item.label}</TooltipContent>
                                </Tooltip>
                            );
                        })}
                        {/* Documents */}
                        {currentNavItems.filter(item => item.label === 'Documents').map((item) => {
                            const isActive = currentUrl === item.href || (item.href !== route('logout') && currentUrl.startsWith(item.href));
                            return (
                                <Tooltip key={item.label}>
                                    <TooltipTrigger asChild>
                                        <Link
                                            href={item.href}
                                            {...(item.method ? { method: item.method as any } : {})}
                                            aria-label={item.label}
                                            className={`flex items-center justify-center w-11 h-11 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm border ${isActive
                                                ? 'text-red-700 bg-red-50 border-red-200 ring-2 ring-red-500 dark:text-red-400 dark:bg-red-900/20 dark:border-red-700'
                                                : 'text-gray-700 bg-white border-gray-200 hover:text-red-700 hover:bg-red-50 hover:border-red-300 active:scale-95 dark:text-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:hover:text-red-400 dark:hover:bg-red-900/20 dark:hover:border-red-600'
                                                }`}
                                        >
                                            {item.icon}
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent>{item.label}</TooltipContent>
                                </Tooltip>
                            );
                        })}
                        {/* Notification Bell */}
                        <div className="relative" ref={notifRef}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        className={`relative flex items-center justify-center w-11 h-11 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm border border-gray-200 bg-white hover:bg-red-50 active:scale-95 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-red-900/20 ${notifOpen ? 'ring-2 ring-red-500' : ''}`}
                                        onClick={() => setNotifOpen((open) => !open)}
                                        aria-label="Notifications"
                                    >
                                        <Bell className={`w-4 h-4 ${unreadCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'} transition-colors`} />
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5 shadow-md border-2 border-white dark:border-gray-800 font-bold">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>Notifications</TooltipContent>
                            </Tooltip>
                            {/* Dropdown */}
                            {notifOpen && (
                                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 animate-fade-in">
                                    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                                        <span className="font-semibold text-gray-800 dark:text-gray-200">Notifications</span>
                                        {notifications.length > 0 && (
                                            <button
                                                onClick={handleMarkAllAsRead}
                                                className="text-xs text-red-600 dark:text-red-400 hover:underline font-semibold px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                            >
                                                Mark all as read
                                            </button>
                                        )}
                                    </div>
                                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
                                        {notifications.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center p-6 text-gray-500 dark:text-gray-400 text-center gap-2">
                                                <Inbox className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-2" />
                                                <span>No new notifications</span>
                                            </div>
                                        ) : (
                                            notifications.map((notif: any) => (
                                                <div key={notif.id} className={`p-4 transition-all flex items-center gap-3 cursor-pointer rounded ${notif.read_at ? 'bg-gray-50 dark:bg-gray-700' : 'hover:bg-red-100 dark:hover:bg-red-900/20'}`}>
                                                    {/* Icon */}
                                                    <div className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm border text-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-700">
                                                        <Bell className="w-5 h-5" />
                                                    </div>
                                                    {/* Content */}
                                                    <div className="flex-1 flex flex-col gap-1 min-w-0">
                                                        <div className="text-sm text-gray-800 dark:text-gray-200 font-medium break-words">{notif.data.message}</div>
                                                        {notif.data.document_name && (
                                                            <div className="text-xs text-gray-700 dark:text-gray-300 font-semibold truncate">Document: {notif.data.document_name}</div>
                                                        )}
                                                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{new Date(notif.created_at).toLocaleString()}</div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Profile */}
                        {currentNavItems.filter(item => item.label === 'Profile').map((item) => {
                            const isActive = currentUrl === item.href || (item.href !== route('logout') && currentUrl.startsWith(item.href));
                            return (
                                <Tooltip key={item.label}>
                                    <TooltipTrigger asChild>
                                        <Link
                                            href={item.href}
                                            {...(item.method ? { method: item.method as any } : {})}
                                            aria-label={item.label}
                                            className={`flex items-center justify-center w-11 h-11 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm border ${isActive
                                                ? 'text-red-700 bg-red-50 border-red-200 ring-2 ring-red-500 dark:text-red-400 dark:bg-red-900/20 dark:border-red-700'
                                                : 'text-gray-700 bg-white border-gray-200 hover:text-red-700 hover:bg-red-50 hover:border-red-300 active:scale-95 dark:text-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:hover:text-red-400 dark:hover:bg-red-900/20 dark:hover:border-red-600'
                                                }`}
                                        >
                                            {item.icon}
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent>{item.label}</TooltipContent>
                                </Tooltip>
                            );
                        })}
                        {/* Logout */}
                        {currentNavItems.filter(item => item.label === 'Logout').map((item) => {
                            return (
                                <Tooltip key={item.label}>
                                    <TooltipTrigger asChild>
                                        <Link
                                            href={item.href}
                                            {...(item.method ? { method: item.method as any } : {})}
                                            aria-label={item.label}
                                            className={`flex items-center justify-center w-11 h-11 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm border text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 border-red-700 hover:shadow-lg transform hover:scale-105 dark:from-red-500 dark:to-red-600 dark:hover:from-red-600 dark:hover:to-red-700`}
                                        >
                                            {item.icon}
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent>{item.label}</TooltipContent>
                                </Tooltip>
                            );
                        })}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="p-3 rounded-xl text-gray-600 dark:text-gray-300 hover:text-red-700 dark:hover:text-red-400 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 dark:hover:from-red-900/20 dark:hover:to-red-800/20 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-200"
                            aria-expanded={menuOpen}
                            aria-controls="mobile-menu"
                            aria-label="Toggle menu"
                        >
                            {menuOpen ? (
                                <XCircle className="h-6 w-6" />
                            ) : (
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div
                id="mobile-menu"
                ref={menuRef}
                className={`md:hidden transition-all duration-300 ease-in-out ${menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'} overflow-hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg z-40`}
            >
                <div className="px-4 py-6 space-y-3">
                    {/* Navigation Items */}
                    {currentNavItems.map((item, index) => {
                        const isActive = currentUrl === item.href || (item.href !== route('logout') && currentUrl.startsWith(item.href));
                        const isLogout = item.label === 'Logout';
                        return (
                            <Tooltip key={index}>
                                <TooltipTrigger asChild>
                                    <Link
                                        href={item.href}
                                        {...(item.method ? { method: item.method as any } : {})}
                                        aria-label={item.label}
                                        className={`flex items-center gap-3 justify-start w-full h-12 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm border px-4 ${isLogout
                                            ? 'text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 border-red-700 shadow-lg dark:from-red-500 dark:to-red-600 dark:hover:from-red-600 dark:hover:to-red-700'
                                            : isActive
                                                ? 'text-red-700 bg-red-50 border-red-200 ring-2 ring-red-500 dark:text-red-400 dark:bg-red-900/20 dark:border-red-700'
                                                : 'text-gray-700 bg-white border-gray-200 hover:text-red-700 hover:bg-red-50 hover:border-red-300 active:scale-95 dark:text-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:hover:text-red-400 dark:hover:bg-red-900/20 dark:hover:border-red-600'
                                            }`}
                                    >
                                        {item.icon}
                                        <span className="text-sm">{item.label}</span>
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent>{item.label}</TooltipContent>
                            </Tooltip>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
