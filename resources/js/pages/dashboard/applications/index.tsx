import { Head, Link, usePage } from '@inertiajs/react';
import {
    Box,
    GitBranch,
    Globe,
    Layers,
    Server,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import ApplicationsTopNav from './components/top-nav';

export default function ApplicationsOverview() {
    const page = usePage();
    const currentTeam = (page.props as Record<string, any>).currentTeam;
    const teamSlug = currentTeam?.slug || 'default';

    // Mock data for overview
    const recentlyDeployed = {
        id: 'app_1',
        name: 'laravel-starter',
        environment: 'production',
        repository: 'dyzulk/laravel-starter',
        branch: 'main',
        domainStatus: 'Domain pending',
        status: 'Never deployed',
    };

    const latestDeployments = [
        // Empty for now or mock data
    ];

    return (
        <>
            <Head title="Applications Overview" />

            <div className="flex flex-col gap-6 p-6">
                <ApplicationsTopNav activeTab="overview" />

                <div className="space-y-6">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Recently deployed
                    </h2>

                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Big Card for Recently Deployed */}
                        <Link
                            href={`/${teamSlug}/applications/${recentlyDeployed.name}/overview`}
                            className="group block"
                        >
                            <Card className="border-border/80 p-6 shadow-xs transition-all hover:border-primary/50 hover:shadow-md h-full">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center space-x-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                            <Box className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors text-base">
                                                {recentlyDeployed.name}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge
                                                    variant="secondary"
                                                    className="bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px]"
                                                >
                                                    {recentlyDeployed.environment}
                                                </Badge>
                                                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
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

                                <div className="space-y-3 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <GitBranch className="h-4 w-4" />
                                        <span>{recentlyDeployed.repository}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs">
                                        <Globe className="h-4 w-4 text-muted-foreground/70" />
                                        <span>{recentlyDeployed.domainStatus}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs">
                                        <Server className="h-4 w-4 text-muted-foreground/70" />
                                        <span className="font-mono bg-muted/50 px-1.5 py-0.5 rounded text-[10px]">{recentlyDeployed.branch}</span>
                                        <span>•</span>
                                        <span>{recentlyDeployed.status}</span>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    </div>
                </div>

                <div className="mt-8 space-y-4">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Latest deployments
                    </h2>
                    
                    {latestDeployments.length === 0 ? (
                        <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/10 p-8 text-center">
                            <Layers className="h-8 w-8 text-muted-foreground/60 mb-3" />
                            <p className="text-sm text-muted-foreground">
                                No deployments found.
                            </p>
                        </div>
                    ) : (
                        <Card className="overflow-hidden">
                            {/* Table logic would go here */}
                        </Card>
                    )}
                </div>
            </div>
        </>
    );
}

ApplicationsOverview.layout = (props: any) => ({
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
