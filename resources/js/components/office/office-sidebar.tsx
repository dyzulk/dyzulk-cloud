import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    Briefcase,
    DollarSign,
    FolderGit2,
    LayoutGrid,
    Megaphone,
} from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { NavMain } from '@/components/nav-main';
import { OfficeNavEmployee } from '@/components/office/office-nav-employee';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { getRelativeUrl } from '@/lib/utils';
import { dashboard as officeDashboard } from '@/routes/office';
import { index as officeSslCaIndex } from '@/routes/office/ssl/ca';
import type { NavItem } from '@/types';
import type { Employee } from '@/types/office';

export function OfficeSidebar() {
    const page = usePage<{ auth: { employee: Employee } }>();
    const employee = page.props.auth.employee;

    const dashboardUrl = getRelativeUrl(officeDashboard.url());
    const financeUrl = '/finance'; // TODO: Nanti diganti Wayfinder saat rutenya sudah ada
    const marketingUrl = '/marketing';
    const planningUrl = '/planning';
    const reportsUrl = '/reports';
    const caAdminUrl = getRelativeUrl(officeSslCaIndex.url());

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboardUrl,
            icon: LayoutGrid,
        },
    ];

    // Department-specific nav items
    const departmentNavItems: NavItem[] = [];

    if (
        employee.role === 'administrator' ||
        employee.department === 'finance'
    ) {
        departmentNavItems.push({
            title: 'Finance',
            href: financeUrl,
            icon: DollarSign,
        });
    }

    if (
        employee.role === 'administrator' ||
        employee.department === 'marketing'
    ) {
        departmentNavItems.push({
            title: 'Marketing',
            href: marketingUrl,
            icon: Megaphone,
        });
    }

    if (
        employee.role === 'administrator' ||
        employee.department === 'planning'
    ) {
        departmentNavItems.push({
            title: 'Planning',
            href: planningUrl,
            icon: Briefcase,
        });
    }

    if (employee.role === 'administrator') {
        departmentNavItems.push({
            title: 'Reports',
            href: reportsUrl,
            icon: BarChart3,
        });
        departmentNavItems.push({
            title: 'CA Admin',
            href: caAdminUrl,
            icon: FolderGit2,
        });
    }

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/" prefetch>
                                <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                                    <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
                                </div>
                                <div className="ml-1 grid flex-1 text-left text-sm">
                                    <span className="mb-0.5 truncate leading-tight font-semibold">
                                        Office
                                    </span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={[...mainNavItems, ...departmentNavItems]} />
            </SidebarContent>

            <SidebarFooter>
                <OfficeNavEmployee />
            </SidebarFooter>
        </Sidebar>
    );
}
