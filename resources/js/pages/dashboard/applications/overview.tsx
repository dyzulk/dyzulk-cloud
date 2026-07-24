import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowUpRight,
    CheckCircle2,
    Cpu,
    GitBranch,
    Globe,
    Layers,
    Plus,
    RefreshCw,
    Rocket,
    Shield,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ApplicationLayout from '@/layouts/app/application-layout';

type Props = {
    application?: {
        name: string;
        environment: string;
        region: string;
        repository: string;
        branch: string;
        compute: string;
        status: 'live' | 'deploying' | 'failed' | 'idle';
    };
};

export default function Overview({ application }: Props) {
    const page = usePage();
    const currentTeam = (page.props as Record<string, any>).currentTeam;
    const teamSlug = currentTeam?.slug || 'default';

    const appData = application || {
        name: 'laravel-starter',
        environment: 'production',
        region: 'Asia Pacific (Singapore)',
        repository: 'dyzulk/laravel-starter',
        branch: 'main',
        compute: 'Flex 512 MiB',
        status: 'live' as const,
    };

    return (
        <>
            <Head title={`${appData.name} - Overview`} />

            <div className="flex flex-col gap-6 p-6">
                {/* Header Banner */}
                <div className="flex flex-col justify-between gap-4 border-b border-border/60 pb-5 md:flex-row md:items-center">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                {appData.name}
                            </h1>
                            <Badge variant="secondary" className="font-mono text-xs">
                                {appData.environment}
                            </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <GitBranch className="h-3.5 w-3.5" />
                                {appData.repository}:{appData.branch}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <Globe className="h-3.5 w-3.5" />
                                {appData.region}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="gap-1.5">
                            <RefreshCw className="h-3.5 w-3.5" />
                            Redeploy
                        </Button>
                        <Button size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white">
                            <Rocket className="h-3.5 w-3.5" />
                            Deploy
                        </Button>
                    </div>
                </div>

                {/* Topology & Architecture Overview */}
                <Card className="overflow-hidden border-border/80 shadow-xs">
                    <CardHeader className="border-b border-border/40 bg-muted/30 px-6 py-4">
                        <CardTitle className="text-base font-semibold">
                            Network & Architecture Topology
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Infrastructure layout for edge routing, compute cluster, and attached resources.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid gap-4 md:grid-cols-3">
                            {/* Edge Network Card */}
                            <div className="rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40">
                                <div className="mb-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2 font-medium text-foreground text-sm">
                                        <Shield className="h-4 w-4 text-blue-500" />
                                        <span>Edge Network</span>
                                    </div>
                                    <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30 bg-emerald-500/10">
                                        Active
                                    </Badge>
                                </div>
                                <div className="space-y-2 text-xs text-muted-foreground">
                                    <div className="flex justify-between border-b border-border/40 pb-1.5">
                                        <span>DDoS Protection</span>
                                        <span className="font-medium text-foreground">Enabled</span>
                                    </div>
                                    <div className="flex justify-between border-b border-border/40 pb-1.5">
                                        <span>Global CDN</span>
                                        <span className="font-medium text-foreground">Active</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Edge Caching</span>
                                        <span className="font-medium text-foreground">Standard</span>
                                    </div>
                                </div>
                            </div>

                            {/* App Cluster Card */}
                            <div className="rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40">
                                <div className="mb-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2 font-medium text-foreground text-sm">
                                        <Cpu className="h-4 w-4 text-purple-500" />
                                        <span>App Cluster</span>
                                    </div>
                                    <Badge variant="outline" className="text-[10px] text-purple-600 border-purple-500/30 bg-purple-500/10">
                                        {appData.compute}
                                    </Badge>
                                </div>
                                <div className="space-y-2 text-xs text-muted-foreground">
                                    <div className="flex justify-between border-b border-border/40 pb-1.5">
                                        <span>Region</span>
                                        <span className="font-medium text-foreground">ap-southeast-1</span>
                                    </div>
                                    <div className="flex justify-between border-b border-border/40 pb-1.5">
                                        <span>Scale Workers</span>
                                        <span className="font-medium text-foreground">1 Instance</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>PHP Runtime</span>
                                        <span className="font-medium text-foreground">v8.5</span>
                                    </div>
                                </div>
                            </div>

                            {/* Add Resource Action Card */}
                            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 p-4 text-center">
                                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <Plus className="h-5 w-5" />
                                </div>
                                <h4 className="text-xs font-semibold text-foreground">Add Resource</h4>
                                <p className="mt-1 text-[11px] text-muted-foreground">
                                    Attach PostgreSQL, Redis, S3 Bucket or WebSockets to this service.
                                </p>
                                <Button variant="outline" size="sm" className="mt-3 h-7 gap-1 text-xs">
                                    <Layers className="h-3.5 w-3.5" />
                                    Browse Resources
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Latest Deployments */}
                <Card className="border-border/80 shadow-xs">
                    <CardHeader className="border-b border-border/40 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-semibold">
                                Latest Deployments
                            </CardTitle>
                            <Button variant="ghost" size="sm" asChild className="h-7 text-xs text-muted-foreground hover:text-foreground">
                                <Link href={`/${teamSlug}/applications/${appData.name}/deployments`}>
                                    View all
                                    <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-border/40 text-xs">
                            <div className="flex items-center justify-between p-4 hover:bg-muted/20">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    <div>
                                        <div className="font-medium text-foreground">
                                            Update application routes and sidebar layout
                                        </div>
                                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                            <span className="font-mono">dep_9f3a1b2</span>
                                            <span>•</span>
                                            <span>main branch</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-right">
                                    <span className="text-muted-foreground">2 mins ago</span>
                                    <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600">
                                        Success
                                    </Badge>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 hover:bg-muted/20">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    <div>
                                        <div className="font-medium text-foreground">
                                            Configure Inertia v3 SSR bundler
                                        </div>
                                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                            <span className="font-mono">dep_4e8c9d0</span>
                                            <span>•</span>
                                            <span>main branch</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-right">
                                    <span className="text-muted-foreground">1 hour ago</span>
                                    <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600">
                                        Success
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Overview.layout = (props: any) => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: props.currentTeam ? `/${props.currentTeam.slug}/dashboard` : '/',
        },
        {
            title: 'Applications',
            href: props.currentTeam ? `/${props.currentTeam.slug}/applications/laravel-starter/overview` : '#',
        },
        {
            title: 'Overview',
            href: '#',
        },
    ],
    children: (page: React.ReactNode) => (
        <ApplicationLayout
            applicationName="laravel-starter"
            environment="production"
            status="live"
        >
            {page}
        </ApplicationLayout>
    ),
});
