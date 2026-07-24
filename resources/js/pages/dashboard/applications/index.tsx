import { Head, Link, usePage } from '@inertiajs/react';
import {
    Box,
    GitBranch,
    Globe,
    Layers,
    Plus,
    PlusCircle,
    Server,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';

type Props = {
    applications?: Array<{
        id: string;
        name: string;
        environment: string;
        repository: string;
        branch: string;
        domainStatus: string;
        status: string;
    }>;
};

export default function ApplicationsIndex({ applications }: Props) {
    const page = usePage();
    const currentTeam = (page.props as Record<string, any>).currentTeam;
    const teamSlug = currentTeam?.slug || 'default';

    const defaultApps = [
        {
            id: 'app_1',
            name: 'laravel-starter',
            environment: 'production',
            repository: 'dyzulk/laravel-starter',
            branch: 'main',
            domainStatus: 'Domain pending',
            status: 'Never deployed',
        },
    ];

    const appList = applications || defaultApps;
    const [viewMode, setViewMode] = useState<'list' | 'empty'>(appList.length > 0 ? 'list' : 'empty');

    return (
        <>
            <Head title="Applications" />

            <div className="flex flex-col gap-6 p-6">
                {/* Top Tabs Navigation (Laravel Cloud Style) */}
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div className="flex items-center space-x-6 text-sm font-medium">
                        <Link
                            href={`/${teamSlug}/dashboard`}
                            className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                            Overview
                        </Link>
                        <span className="relative border-b-2 border-primary pb-3 font-semibold text-foreground">
                            Applications
                        </span>
                        <span className="text-muted-foreground/60 transition-colors hover:text-muted-foreground cursor-not-allowed">
                            Resources
                        </span>
                        <span className="text-muted-foreground/60 transition-colors hover:text-muted-foreground cursor-not-allowed">
                            Usage
                        </span>
                        <span className="text-muted-foreground/60 transition-colors hover:text-muted-foreground cursor-not-allowed">
                            Settings
                        </span>
                    </div>

                    {/* View Switcher Toggle for Demo */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewMode(viewMode === 'list' ? 'empty' : 'list')}
                            className="h-7 text-xs text-muted-foreground"
                        >
                            Toggle Demo State ({viewMode === 'list' ? 'Show Empty' : 'Show List'})
                        </Button>
                        <Button
                            size="sm"
                            asChild
                            className="h-8 gap-1.5 bg-neutral-900 text-xs text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                        >
                            <Link href={`/${teamSlug}/applications/create`}>
                                <Plus className="h-4 w-4" />
                                New application
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Conditional Rendering: List View vs Empty State */}
                {viewMode === 'list' ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Recently deployed
                            </h2>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {appList.map((app) => (
                                <Link
                                    key={app.id}
                                    href={`/${teamSlug}/applications/${app.name}/overview`}
                                    className="group block"
                                >
                                    <Card className="border-border/80 p-5 shadow-xs transition-all hover:border-primary/50 hover:shadow-md">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2.5">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                                    <Box className="h-4 w-4" />
                                                </div>
                                                <span className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm">
                                                    {app.name}
                                                </span>
                                            </div>
                                            <Badge
                                                variant="secondary"
                                                className="bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px]"
                                            >
                                                {app.environment}
                                            </Badge>
                                        </div>

                                        <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1.5">
                                                <GitBranch className="h-3.5 w-3.5" />
                                                <span>{app.repository}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[11px]">
                                                <Globe className="h-3.5 w-3.5 text-muted-foreground/70" />
                                                <span>{app.domainStatus}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[11px]">
                                                <Server className="h-3.5 w-3.5 text-muted-foreground/70" />
                                                <span className="font-mono">{app.branch}</span>
                                                <span>•</span>
                                                <span>{app.status}</span>
                                            </div>
                                        </div>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* Empty State View (matching Laravel Cloud Image 3) */
                    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/10 p-8 text-center">
                        <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-2xl bg-muted/40 p-4 shadow-inner">
                            <Layers className="h-12 w-12 text-muted-foreground/60" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">
                            No applications yet
                        </h3>
                        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                            Get started and create your first application service.
                        </p>
                        <Button
                            asChild
                            className="mt-6 gap-1.5 bg-neutral-900 text-xs text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                        >
                            <Link href={`/${teamSlug}/applications/create`}>
                                <Plus className="h-4 w-4" />
                                New application
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        </>
    );
}

ApplicationsIndex.layout = (props: any) => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: props.currentTeam ? `/${props.currentTeam.slug}/dashboard` : '/',
        },
        {
            title: 'Applications',
            href: '#',
        },
    ],
    children: (page: React.ReactNode) => <AppLayout>{page}</AppLayout>,
});
