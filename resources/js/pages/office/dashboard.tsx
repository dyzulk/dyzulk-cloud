import { Head, usePage } from '@inertiajs/react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import type { Employee } from '@/types/office';

export default function OfficeDashboard() {
    const { auth } = usePage<{ auth: { employee: Employee } }>().props;
    const employee = auth.employee;

    const departmentLabel =
        employee.department.charAt(0).toUpperCase() +
        employee.department.slice(1);

    const roleLabel =
        employee.role.charAt(0).toUpperCase() + employee.role.slice(1);

    return (
        <>
            <Head title="Office Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 p-6 dark:border-sidebar-border">
                        <div className="flex flex-col gap-1">
                            <span className="text-sm text-muted-foreground">
                                Welcome back
                            </span>
                            <span className="text-lg font-semibold">
                                {employee.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {roleLabel} &middot; {departmentLabel}
                            </span>
                        </div>
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                </div>
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                </div>
            </div>
        </>
    );
}

OfficeDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/',
        },
    ],
};
