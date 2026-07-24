import { Link, usePage } from '@inertiajs/react';
import {
    Activity,
    ArrowLeft,
    Box,
    Database,
    FileText,
    Globe,
    Key,
    Rocket,
    Settings,
    Terminal,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavUser } from '@/components/nav-user';
import { Badge } from '@/components/ui/badge';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

type Props = {
    applicationName?: string;
    environment?: string;
    status?: 'live' | 'deploying' | 'failed' | 'idle';
};

export function ApplicationSidebar({
    applicationName = 'laravel-starter',
    environment = 'production',
    status = 'live',
}: Props) {
    const page = usePage();
    const { isCurrentUrl } = useCurrentUrl();
    const currentTeam = (page.props as Record<string, any>).currentTeam;

    const teamSlug = currentTeam?.slug || 'default';
    const dashboardUrl = currentTeam ? dashboard(currentTeam.slug) : '/';

    const baseUrl = `/${teamSlug}/applications/${applicationName}`;

    const appNavItems: NavItem[] = [
        {
            title: 'Overview',
            href: `${baseUrl}/overview`,
            icon: Globe,
        },
        {
            title: 'Deployments',
            href: `${baseUrl}/deployments`,
            icon: Rocket,
        },
        {
            title: 'Commands',
            href: `${baseUrl}/commands`,
            icon: Terminal,
        },
        {
            title: 'Logs',
            href: `${baseUrl}/logs`,
            icon: FileText,
        },
        {
            title: 'Metrics',
            href: `${baseUrl}/metrics`,
            icon: Activity,
        },
        {
            title: 'Resources',
            href: `${baseUrl}/resources`,
            icon: Database,
        },
        {
            title: 'Environment Variables',
            href: `${baseUrl}/env-vars`,
            icon: Key,
        },
        {
            title: 'Settings',
            href: `${baseUrl}/settings`,
            icon: Settings,
        },
    ];

    const getStatusBadge = () => {
        switch (status) {
            case 'live':
                return (
                    <Badge variant="outline" className="gap-1.5 border-emerald-500/30 bg-emerald-500/10 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                        Live
                    </Badge>
                );
            case 'deploying':
                return (
                    <Badge variant="outline" className="gap-1.5 border-amber-500/30 bg-amber-500/10 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                        <span className="h-1.5 w-1.5 animate-ping rounded-full bg-amber-500" />
                        Deploying
                    </Badge>
                );
            case 'failed':
                return (
                    <Badge variant="outline" className="gap-1.5 border-rose-500/30 bg-rose-500/10 text-[11px] font-medium text-rose-600 dark:text-rose-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                        Failed
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="text-[11px] text-muted-foreground">
                        Idle
                    </Badge>
                );
        }
    };

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader className="gap-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboardUrl} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>

                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild className="text-muted-foreground hover:text-foreground">
                            <Link href={dashboardUrl}>
                                <ArrowLeft className="h-4 w-4" />
                                <span>Back to Dashboard</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>

                <div className="mx-2 rounded-lg border border-sidebar-border bg-sidebar-accent/50 p-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 overflow-hidden">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                                <Box className="h-4 w-4" />
                            </div>
                            <div className="truncate">
                                <p className="truncate text-xs font-semibold text-sidebar-foreground">
                                    {applicationName}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                    {environment}
                                </p>
                            </div>
                        </div>
                        {getStatusBadge()}
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup className="px-2 py-0">
                    <SidebarGroupLabel>Application Service</SidebarGroupLabel>
                    <SidebarMenu>
                        {appNavItems.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isCurrentUrl(item.href)}
                                    tooltip={{ children: item.title }}
                                >
                                    <Link href={item.href} prefetch>
                                        {item.icon && <item.icon className="h-4 w-4" />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
