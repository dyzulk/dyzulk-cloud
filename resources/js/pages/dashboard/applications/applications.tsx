import { Head, Link, usePage } from '@inertiajs/react';
import {
    Box,
    GitBranch,
    Globe,
    Layers,
    Plus,
    Server,
    MoreHorizontal
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import ApplicationsTopNav from './components/top-nav';

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

export default function ApplicationsList({ applications }: Props) {
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
    const [viewMode, setViewMode] = useState<'list' | 'empty'>(
        applications && applications.length > 0 ? 'list' : 'empty',
    );

    return (
        <>
            <Head title="Applications" />

            <div className="flex flex-col gap-6 p-6">
                <ApplicationsTopNav 
                    activeTab="applications" 
                    onToggleDemo={() => setViewMode(viewMode === 'list' ? 'empty' : 'list')}
                    viewMode={viewMode}
                />

                {viewMode === 'list' ? (
                    <div className="space-y-6">
                        {/* Grouping header placeholder, e.g. "dyzulkdev/laravel-starter" */}
                        <div className="flex flex-col space-y-3">
                            {appList.map((app) => (
                                <Card key={app.id} className="overflow-hidden border-border/80 shadow-xs hover:border-primary/30 transition-colors">
                                    {/* Application Header Bar */}
                                    <div className="flex items-center justify-between border-b border-border/40 bg-muted/20 px-5 py-3">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary">
                                                <Box className="h-4 w-4" />
                                            </div>
                                            <span className="font-semibold text-foreground text-sm">
                                                {app.name}
                                            </span>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    
                                    {/* Application Environment Row */}
                                    <Link
                                        href={`/${teamSlug}/applications/${app.name}/overview`}
                                        className="group block"
                                    >
                                        <div className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-muted/30">
                                            <div className="flex items-center space-x-6 w-full max-w-4xl">
                                                <div className="flex items-center gap-2 w-32 shrink-0">
                                                    <Badge
                                                        variant="secondary"
                                                        className="bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px]"
                                                    >
                                                        {app.environment}
                                                    </Badge>
                                                </div>
                                                
                                                <div className="flex flex-1 items-center justify-between text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-1.5 w-1/3">
                                                        <GitBranch className="h-3.5 w-3.5" />
                                                        <span className="truncate">{app.repository}</span>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-1.5 w-1/3">
                                                        <Server className="h-3.5 w-3.5 text-muted-foreground/70" />
                                                        <span className="font-mono bg-muted/50 px-1.5 py-0.5 rounded text-[10px]">{app.branch}</span>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-2 w-1/4 justify-end">
                                                        <span className="flex items-center gap-1.5 text-xs">
                                                            <span className="relative flex h-2 w-2">
                                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                                                            </span>
                                                            Sleeping
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </Card>
                            ))}
                        </div>
                    </div>
                ) : (
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

ApplicationsList.layout = (props: any) => ({
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
