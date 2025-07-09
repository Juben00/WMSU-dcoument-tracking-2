import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Building, Folder, LayoutGrid, Users, Users2, FileText, ListChecks, BarChart3 } from 'lucide-react';
import AppLogo from './app-logo';
import WmsuLogo from './WmsuLogo';
import { useSidebar } from '@/components/ui/sidebar';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Departments',
        href: '/Admin/departments',
        icon: Building,
    },
    {
        title: 'Users',
        href: '/Admin/users',
        icon: Users2,
    },
    {
        title: 'Published Documents',
        href: '/Admin/published-documents',
        icon: FileText,
    },
    {
        title: 'Activity Logs',
        href: '/Admin/activity-logs',
        icon: ListChecks,
    },
    {
        title: 'Analytics',
        href: '/Admin/analytics',
        icon: BarChart3,
    },
];

const footerNavItems: NavItem[] = [
    // {
    //     title: 'Repository',
    //     href: 'https://github.com/laravel/react-starter-kit',
    //     icon: Folder,
    // },
    // {
    //     title: 'Documentation',
    //     href: 'https://laravel.com/docs/starter-kits#react',
    //     icon: BookOpen,
    // },
];

export function AppSidebar() {
    const { state } = useSidebar();
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                {state === 'collapsed' ? (
                                    <div className="flex items-center justify-center">
                                        <WmsuLogo className="size-8" />
                                    </div>
                                ) : (
                                    <AppLogo />
                                )}
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
