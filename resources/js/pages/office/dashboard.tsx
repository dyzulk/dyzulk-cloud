import { Head, usePage } from '@inertiajs/react';
import { Users, Building, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import type { Employee } from '@/types/office';

interface DashboardProps {
    stats: {
        total_users: number;
        total_teams: number;
        total_certificates: number;
        total_deployments: number;
    };
}

export default function OfficeDashboard({ stats }: DashboardProps) {
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
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-base p-4 font-base">
                
                {/* KPI Cards Row */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                    <Card className="bg-main text-main-foreground">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Welcome back
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{employee.name}</div>
                            <p className="text-xs mt-1">
                                {roleLabel} &middot; {departmentLabel}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Users
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_users}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Active Teams
                            </CardTitle>
                            <Building className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_teams}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                SSL Certificates
                            </CardTitle>
                            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_certificates}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 flex-1">
                    <Card className="col-span-4 min-h-[400px] flex flex-col relative overflow-hidden">
                        <CardHeader>
                            <CardTitle>Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 p-0 m-6 relative rounded-base border-2 border-border bg-secondary-background">
                           <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                        </CardContent>
                    </Card>

                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>
                                System events will appear here.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-foreground/70">
                                No recent activity to display.
                            </div>
                        </CardContent>
                    </Card>
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
