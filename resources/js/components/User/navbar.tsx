import React, { useState, useEffect, useRef } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import WmsuLogo from '../WmsuLogo';
import { FileText, Users, User, LogOut, Building, Bell, XCircle, Inbox, LayoutGrid, Menu, ChevronDown } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from "../ui/tooltip";
import AppearanceToggleDropdown from '../appearance-dropdown';
import { PageProps as InertiaPageProps } from '@inertiajs/core';

interface AuthUser {
    role?: string;
    name?: string;
    email?: string;
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

const Navbar = () => {
    const page = usePage<PageProps>();
    const { auth, notifications } = page.props;

    const [menuOpen, setMenuOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [localNotifications, setLocalNotifications] = useState(notifications || []);
    const [isMarkingAsRead, setIsMarkingAsRead] = useState(false);
    const [markingNotifications, setMarkingNotifications] = useState<Set<string>>(new Set());
    const notifRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);

    const role = auth?.user?.role || 'user';
    const currentUrl = page.url;

    // Update local notifications when props change
    useEffect(() => {
        setLocalNotifications(notifications || []);
    }, [notifications]);

    const unreadCount = localNotifications.filter((n: any) => !n.read_at).length;

    const handleMarkAllAsRead = () => {
        if (isMarkingAsRead) return;

        setIsMarkingAsRead(true);

        // Use Inertia router instead of fetch
        router.post('/notifications/read-all', {}, {
            onSuccess: () => {
                // Update local state to mark all notifications as read
                setLocalNotifications((prev: any[]) =>
                    prev.map((notif: any) => ({
                        ...notif,
                        read_at: notif.read_at || new Date().toISOString()
                    }))
                );
                setNotifOpen(false);
                setIsMarkingAsRead(false);
            },
            onError: () => {
                console.error('Failed to mark notifications as read');
                setIsMarkingAsRead(false);
            }
        });
    };

    const handleMarkAsRead = (notificationId: string) => {
        if (markingNotifications.has(notificationId)) return;

        setMarkingNotifications(prev => new Set(prev).add(notificationId));

        // Use Inertia router instead of fetch
        router.post(`/notifications/${notificationId}/read`, {}, {
            onSuccess: () => {
                // Update local state to mark this notification as read
                setLocalNotifications((prev: any[]) =>
                    prev.map((notif: any) =>
                        notif.id === notificationId
                            ? { ...notif, read_at: notif.read_at || new Date().toISOString() }
                            : notif
                    )
                );
                setMarkingNotifications(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(notificationId);
                    return newSet;
                });
            },
            onError: () => {
                console.error('Error marking notification as read');
                setMarkingNotifications(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(notificationId);
                    return newSet;
                });
            }
        });
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setNotifOpen(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setProfileOpen(false);
            }
            if (menuOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [notifOpen, profileOpen, menuOpen]);

    const NavItems: NavItem[] = [
        {
            label: 'Dashboard',
            href: '/dashboard',
            icon: <LayoutGrid className="w-5 h-5" />,
        },
        {
            label: 'Documents',
            href: '/documents',
            icon: <FileText className="w-5 h-5" />,
        },
    ];

    const AdminNavItems: NavItem[] = [
        {
            label: 'Dashboard',
            href: '/dashboard',
            icon: <LayoutGrid className="w-5 h-5" />,
        },
        {
            label: 'Departments',
            href: '/departments',
            icon: <Building className="w-5 h-5" />,
        },
        {
            label: 'Documents',
            href: '/documents',
            icon: <FileText className="w-5 h-5" />,
        },
    ];

    const currentNavItems = role === 'admin' ? AdminNavItems : NavItems;

    const getInitials = (name: string) => {
        if (!name || name.trim() === '') return 'U';

        return name
            .trim()
            .split(' ')
            .filter(word => word.length > 0) // Filter out empty strings
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Get user display name and initials
    const getUserDisplayName = () => {
        if (auth?.user?.name && auth.user.name.trim() !== '') {
            return auth.user.name;
        }
        // If no name, try to use email username as display name
        if (auth?.user?.email) {
            const emailUsername = auth.user.email.split('@')[0];
            return emailUsername.charAt(0).toUpperCase() + emailUsername.slice(1);
        }
        return 'User';
    };

    const getUserInitials = () => {
        const userName = auth?.user?.name;
        if (userName && userName.trim() !== '') {
            // If name is available, use initials from the name
            return getInitials(userName);
        }
        // If no name, try to get initials from the email's username part
        const userEmail = auth?.user?.email;
        if (userEmail) {
            const emailUsername = userEmail.split('@')[0];
            return getInitials(emailUsername);
        }
        return 'U';
    };

    return (
        <nav className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center flex-shrink-0">
                        <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-90 transition-all duration-200 group">
                            <div className="rounded-lg p-2">
                                <WmsuLogo className="h-8 w-8 text-red-600 dark:text-red-400" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-lg tracking-wide text-gray-900 dark:text-white">WMSU DMTS</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Document Management</span>
                            </div>
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center space-x-1">
                        {currentNavItems.map((item) => {
                            const isActive = currentUrl === item.href || (currentUrl.startsWith(item.href) && item.href !== '/');
                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                        ? 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20'
                                        : 'text-gray-700 hover:text-red-600 hover:bg-red-50 dark:text-gray-300 dark:hover:text-red-400 dark:hover:bg-red-900/20'
                                        }`}
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                    <AppearanceToggleDropdown />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>Toggle theme</TooltipContent>
                        </Tooltip>

                        <div className="relative" ref={notifRef}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        className={`relative p-2 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 ${notifOpen ? 'bg-gray-100 dark:bg-gray-800' : ''
                                            }`}
                                        onClick={() => setNotifOpen(!notifOpen)}
                                        aria-label="Notifications"
                                    >
                                        <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`} />
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                                {unreadCount > 9 ? '9+' : unreadCount}
                                            </span>
                                        )}
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>Notifications</TooltipContent>
                            </Tooltip>

                            {notifOpen && (
                                <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 animate-in slide-in-from-top-2 duration-200">
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                        <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                                        {localNotifications.length > 0 && (
                                            <button
                                                onClick={handleMarkAllAsRead}
                                                className="text-xs text-red-600 dark:text-red-400 hover:underline font-medium px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                                disabled={isMarkingAsRead}
                                            >
                                                {isMarkingAsRead ? 'Marking...' : 'Mark all as read'}
                                            </button>
                                        )}
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {localNotifications.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center p-8 text-gray-500 dark:text-gray-400">
                                                <Inbox className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                                                <p className="text-sm">No new notifications</p>
                                            </div>
                                        ) : (
                                            localNotifications.map((notif: any) => (
                                                <div
                                                    key={notif.id}
                                                    className={`p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${!notif.read_at ? 'cursor-pointer bg-red-50/50 dark:bg-red-900/10' : ''} ${markingNotifications.has(notif.id) ? 'opacity-50' : ''}`}
                                                    onClick={() => !notif.read_at && !markingNotifications.has(notif.id) && handleMarkAsRead(notif.id)}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className="flex-shrink-0 w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                                                            {markingNotifications.has(notif.id) ? (
                                                                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                                            ) : (
                                                                <Bell className="w-4 h-4 text-red-600 dark:text-red-400" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm text-gray-900 dark:text-white font-medium">{notif.data.message}</p>
                                                            {notif.data.document_name && (
                                                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                                    Document: {notif.data.document_name}
                                                                </p>
                                                            )}
                                                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                                {new Date(notif.created_at).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        {!notif.read_at && !markingNotifications.has(notif.id) && <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-2"></div>}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="relative" ref={profileRef}>
                            <button
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 ${profileOpen ? 'bg-gray-100 dark:bg-gray-800' : ''
                                    }`}
                                onClick={() => setProfileOpen(!profileOpen)}
                            >
                                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                    {getUserInitials()}
                                </div>
                                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {profileOpen && (
                                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 animate-in slide-in-from-top-2 duration-200">
                                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold">
                                                {getUserInitials()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{getUserDisplayName()}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{auth?.user?.email || 'user@example.com'}</p>
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 mt-1">
                                                    {role === 'admin' ? 'Administrator' : role === 'receiver' ? 'Receiver' : 'User'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-2">
                                        <Link
                                            href="/profile"
                                            className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                        >
                                            <User className="w-4 h-4" />
                                            Profile Settings
                                        </Link>
                                        <Link
                                            href="/logout"
                                            method="post"
                                            as="button"
                                            className="flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Sign out
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            onClick={() => setMenuOpen(!menuOpen)}
                            aria-expanded={menuOpen}
                        >
                            {menuOpen ? <XCircle className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {menuOpen && (
                <div ref={menuRef} className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 animate-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-4 space-y-2">
                        {currentNavItems.map((item) => {
                            const isActive = currentUrl === item.href || (currentUrl.startsWith(item.href) && item.href !== '/');
                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                        ? 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20'
                                        : 'text-gray-700 hover:text-red-600 hover:bg-red-50 dark:text-gray-300 dark:hover:text-red-400 dark:hover:bg-red-900/20'
                                        }`}
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                            <Link
                                href="/profile"
                                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 dark:text-gray-300 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                            >
                                <User className="w-5 h-5" />
                                Profile Settings
                            </Link>
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                                Sign out
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
