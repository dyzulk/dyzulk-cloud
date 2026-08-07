import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    Briefcase,
    Container,
    DollarSign,
    FolderGit2,
    LayoutGrid,
    Megaphone,
    Server,
    Settings,
    Key,
} from 'lucide-react';
import { index as officeDockerIndex } from '@/actions/App/Http/Controllers/Office/DockerController';
import { index as officeFinanceIndex } from '@/actions/App/Http/Controllers/Office/FinanceController';
import { index as officeMarketingIndex } from '@/actions/App/Http/Controllers/Office/MarketingController';
import { index as officePlanningIndex } from '@/actions/App/Http/Controllers/Office/PlanningController';
import { index as officeReportsIndex } from '@/actions/App/Http/Controllers/Office/ReportsController';
import { index as officeServerIndex } from '@/actions/App/Http/Controllers/Office/ServerController';
import { index as officeSshKeysIndex } from '@/actions/App/Http/Controllers/Office/SshKeyController';
import { index as officeSettingsIndex } from '@/actions/App/Http/Controllers/Office/SettingsController';
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
    const financeUrl = getRelativeUrl(officeFinanceIndex.url());
    const marketingUrl = getRelativeUrl(officeMarketingIndex.url());
    const planningUrl = getRelativeUrl(officePlanningIndex.url());
    const reportsUrl = getRelativeUrl(officeReportsIndex.url());
    const caAdminUrl = getRelativeUrl(officeSslCaIndex.url());
    const dockerUrl = getRelativeUrl(officeDockerIndex.url());
    const serverUrl = getRelativeUrl(officeServerIndex.url());
    const sshKeysUrl = getRelativeUrl(officeSshKeysIndex.url());
    const settingsUrl = getRelativeUrl(officeSettingsIndex.url());

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
            title: 'Docker',
            href: dockerUrl,
            icon: Container,
        });
        departmentNavItems.push({
            title: 'Server',
            href: serverUrl,
            icon: Server,
        });
        departmentNavItems.push({
            title: 'SSH Keys',
            href: sshKeysUrl,
            icon: Key,
        });
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
        departmentNavItems.push({
            title: 'Site Settings',
            href: settingsUrl,
            icon: Settings,
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
