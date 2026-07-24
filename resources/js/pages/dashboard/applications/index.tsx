import { Head, Link, usePage } from '@inertiajs/react';
import {
    Box,
    GitBranch,
    Globe,
    Layers,
    Server,
    CheckCircle2,
    XCircle,
    Clock,
    GitCommit,
    Plus,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ApplicationsTopNav from './components/top-nav';

type Props = {
    recentlyDeployed?: {
        id: number;
        name: string;
        environment: string;
        repository_name: string;
        branch: string;
        status: string;
        deployments?: Array<{
            id: number;
            status: string;
        }>;
    } | null;
    latestDeployments?: Array<{
        id: number;
        commit_sha: string;
        commit_message: string;
        branch: string;
        status: string;
        created_at: string;
        application_name: string;
    }>;
};

export default function ApplicationsOverview({ recentlyDeployed, latestDeployments = [] }: Props) {
    const page = usePage();
    const currentTeam = (page.props as Record<string, any>).currentTeam;
    const teamSlug = currentTeam?.slug || 'default';

    const getStatusIndicator = (status?: string) => {
        switch (status) {
            case 'live':
                return (
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Live
                    </span>
                );
            case 'deploying':
                return (
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                        </span>
                        Deploying
                    </span>
                );
            case 'failed':
                return (
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="relative flex h-2 w-2">
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                        </span>
                        Failed
                    </span>
                );
            default:
                return (
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="relative flex h-2 w-2">
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                        </span>
                        Idle
                    </span>
                );
        }
    };

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
                        {recentlyDeployed ? (
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
                                                    {getStatusIndicator(recentlyDeployed.status)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <GitBranch className="h-4 w-4" />
                                            <span>{recentlyDeployed.repository_name || 'No Repository'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs">
                                            <Globe className="h-4 w-4 text-muted-foreground/70" />
                                            <span>Domain active</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs">
                                            <Server className="h-4 w-4 text-muted-foreground/70" />
                                            <span className="font-mono bg-muted/50 px-1.5 py-0.5 rounded text-[10px]">
                                                {recentlyDeployed.branch}
                                            </span>
                                            <span>•</span>
                                            <span className="capitalize">{recentlyDeployed.status}</span>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        ) : (
                            <div className="flex min-h-[160px] flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/10 p-6 text-center md:col-span-2">
                                <Box className="h-8 w-8 text-muted-foreground/60 mb-2" />
                                <p className="text-sm text-muted-foreground">No applications found.</p>
                                <Button asChild size="sm" className="mt-3 bg-neutral-900 text-xs text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200">
                                    <Link href={`/${teamSlug}/applications/create`}>
                                        <Plus className="h-4 w-4 mr-1.5" />
                                        Create Application
                                    </Link>
                                </Button>
                            </div>
                        )}
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
                            <div className="divide-y divide-border/40 text-xs">
                                {latestDeployments.map((dep) => (
                                    <div
                                        key={dep.id}
                                        className="flex flex-col justify-between gap-3 p-4 transition-colors hover:bg-muted/20 md:flex-row md:items-center"
                                    >
                                        <div className="flex items-start gap-3">
                                            {dep.status === 'success' ? (
                                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                                            ) : dep.status === 'failed' ? (
                                                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                                            ) : (
                                                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                                            )}
                                            <div>
                                                <div className="font-medium text-foreground flex items-center gap-1.5">
                                                    {dep.commit_message || 'No commit message'}
                                                    <span className="text-[10px] text-muted-foreground font-normal">
                                                        on {dep.application_name}
                                                    </span>
                                                </div>
                                                <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                                                    <span className="flex items-center gap-1 font-mono">
                                                        <GitCommit className="h-3 w-3" />
                                                        {dep.commit_sha ? dep.commit_sha.substring(0, 7) : 'N/A'}
                                                    </span>
                                                    <span>•</span>
                                                    <span className="font-mono">{dep.branch}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between gap-4 md:justify-end">
                                            <Badge
                                                variant="outline"
                                                className={
                                                    dep.status === 'success'
                                                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600'
                                                        : dep.status === 'failed'
                                                        ? 'border-rose-500/30 bg-rose-500/10 text-rose-600'
                                                        : 'border-amber-500/30 bg-amber-500/10 text-amber-600'
                                                }
                                            >
                                                {dep.status.toUpperCase()}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
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
});
