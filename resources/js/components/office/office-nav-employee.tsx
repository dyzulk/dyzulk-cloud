import { Link, router, usePage } from '@inertiajs/react';
import { Building2, ChevronsUpDown, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { useInitials } from '@/hooks/use-initials';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import type { Employee } from '@/types/office';

export function OfficeNavEmployee() {
    const { auth } = usePage<{ auth: { employee: Employee } }>().props;
    const employee = auth.employee;
    const { state } = useSidebar();
    const isMobile = useIsMobile();
    const getInitials = useInitials();
    const cleanup = useMobileNavigation();

    const departmentLabel =
        employee.department.charAt(0).toUpperCase() +
        employee.department.slice(1);

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="group text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent"
                            data-test="office-user-menu"
                        >
                            <Avatar className="h-8 w-8 overflow-hidden rounded-lg">
                                <AvatarFallback className="rounded-lg text-black dark:text-white">
                                    {getInitials(employee.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">
                                    {employee.name}
                                </span>
                                <span className="truncate text-xs text-muted-foreground">
                                    {departmentLabel}
                                </span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        align="end"
                        side={
                            isMobile
                                ? 'bottom'
                                : state === 'collapsed'
                                  ? 'left'
                                  : 'bottom'
                        }
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 overflow-hidden rounded-lg">
                                    <AvatarFallback className="rounded-lg text-black dark:text-white">
                                        {getInitials(employee.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">
                                        {employee.name}
                                    </span>
                                    <span className="truncate text-xs text-muted-foreground">
                                        {employee.email}
                                    </span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-xs text-muted-foreground"
                            disabled
                        >
                            <Building2 className="mr-2" />
                            {departmentLabel} &middot;{' '}
                            {employee.role.charAt(0).toUpperCase() +
                                employee.role.slice(1)}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link
                                className="block w-full cursor-pointer"
                                href="/logout"
                                method="post"
                                as="button"
                                onClick={handleLogout}
                                data-test="office-logout-button"
                            >
                                <LogOut className="mr-2" />
                                Log out
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
