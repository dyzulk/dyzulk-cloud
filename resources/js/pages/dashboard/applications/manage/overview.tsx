import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    ArrowUpRight,
    CheckCircle2,
    Cpu,
    Database,
    ExternalLink,
    GitBranch,
    Globe,
    HardDrive,
    Layers,
    Lock,
    Plus,
    Server,
    Shield,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ApplicationLayout from '@/layouts/app/application-layout';
import AppLayout from '@/layouts/app-layout';

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

            {/* Network & Architecture Topology Diagram */}
            <div className="relative w-full rounded-2xl border border-border/80 bg-muted/5 dark:bg-neutral-900/40 p-6 md:p-8 overflow-hidden shadow-xs">
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

                <div className="flex flex-col md:flex-row items-stretch justify-between gap-4 md:gap-0 relative z-10">
                    
                    {/* COLUMN 1: EDGE NETWORK */}
                    <div className="w-full md:w-[28%] bg-muted/20 dark:bg-neutral-900/30 border border-border/40 rounded-2xl p-5 flex flex-col gap-4 relative">
                        <div className="flex items-center justify-between border-b border-border/30 pb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Edge Network</span>
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0.5 border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400">
                                Active
                            </Badge>
                        </div>

                        {/* CDN & Security Card */}
                        <div className="group rounded-xl border border-border bg-card p-4 transition-all duration-300 hover:border-blue-500/50 hover:shadow-md hover:shadow-blue-500/5">
                            <div className="flex items-center gap-2 border-b border-border/40 pb-2 mb-2">
                                <Shield className="h-4 w-4 text-blue-500" />
                                <span className="font-semibold text-foreground text-xs">DNS & CDN Gateway</span>
                            </div>
                            <div className="space-y-1.5 text-[11px] text-muted-foreground">
                                <div className="flex justify-between">
                                    <span>CDN Caching</span>
                                    <span className="font-medium text-foreground">Cloudflare Edge</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>DDoS Protection</span>
                                    <span className="font-medium text-foreground">Advanced (WAF)</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>SSL/TLS</span>
                                    <span className="font-medium text-foreground">Strict (1.3)</span>
                                </div>
                            </div>
                        </div>

                        {/* Domains Card */}
                        <div className="group rounded-xl border border-border bg-card p-4 transition-all duration-300 hover:border-blue-500/50 hover:shadow-md hover:shadow-blue-500/5">
                            <div className="flex items-center gap-2 border-b border-border/40 pb-2 mb-2">
                                <Globe className="h-4 w-4 text-blue-500" />
                                <span className="font-semibold text-foreground text-xs">Routing Domains</span>
                            </div>
                            <div className="space-y-1.5 text-[11px] text-muted-foreground">
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-1">
                                        <Lock className="h-3 w-3 text-emerald-500" />
                                        dyzulk.com
                                    </span>
                                    <Badge variant="outline" className="text-[8px] scale-90 px-1 border-blue-500/20 bg-blue-500/5 text-blue-600">Primary</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-1 text-muted-foreground/80">
                                        <Lock className="h-3 w-3 text-emerald-500" />
                                        {appData.name}.cloud
                                    </span>
                                    <span className="text-[9px] text-muted-foreground">Default</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* GUTTER 1: CONNECTOR LINES */}
                    <div className="hidden md:flex w-[8%] items-center justify-center relative">
                        <svg className="w-full h-48 overflow-visible pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="grad-edge" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                                    <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.8" />
                                    <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
                                </linearGradient>
                            </defs>
                            <path d="M 0,30 L 50,30 L 50,50 L 100,50 M 0,75 L 50,75 L 50,50" stroke="url(#grad-edge)" strokeWidth="1.5" fill="none" />
                            {/* Animated Pulse Dot */}
                            <circle cx="50" cy="50" r="3.5" className="fill-blue-500" />
                            <circle cx="50" cy="50" r="7" className="stroke-blue-500/50 fill-none stroke-2 animate-ping" />
                        </svg>
                    </div>

                    {/* COLUMN 2: COMPUTE CLUSTER */}
                    <div className="w-full md:w-[28%] bg-muted/20 dark:bg-neutral-900/30 border border-border/40 rounded-2xl p-5 flex flex-col gap-4 relative">
                        <div className="flex items-center justify-between border-b border-border/30 pb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">App Cluster</span>
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0.5 border-purple-500/20 bg-purple-500/5 text-purple-600 dark:text-purple-400">
                                Live
                            </Badge>
                        </div>

                        {/* Web Instance Card */}
                        <div className="group rounded-xl border border-border bg-card p-4 transition-all duration-300 hover:border-purple-500/50 hover:shadow-md hover:shadow-purple-500/5">
                            <div className="flex items-center justify-between border-b border-border/40 pb-2 mb-2">
                                <div className="flex items-center gap-2">
                                    <Cpu className="h-4 w-4 text-purple-500" />
                                    <span className="font-semibold text-foreground text-xs">Web Container</span>
                                </div>
                                <span className="text-[9px] font-medium px-1 bg-purple-500/10 text-purple-600 rounded">1x Instance</span>
                            </div>
                            <div className="space-y-2 text-[11px] text-muted-foreground">
                                <div className="flex justify-between">
                                    <span>Specs</span>
                                    <span className="font-medium text-foreground">{appData.compute}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Region</span>
                                    <span className="font-medium text-foreground">ap-southeast-1</span>
                                </div>
                                {/* Mini CPU/RAM Usage bars */}
                                <div className="space-y-1 pt-1 border-t border-border/40">
                                    <div className="flex justify-between text-[9px]">
                                        <span>CPU Usage</span>
                                        <span className="font-mono text-foreground">12%</span>
                                    </div>
                                    <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-purple-500 rounded-full" style={{ width: '12%' }} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Queue Worker Card */}
                        <div className="group rounded-xl border border-border bg-card p-4 transition-all duration-300 hover:border-purple-500/50 hover:shadow-md hover:shadow-purple-500/5">
                            <div className="flex items-center justify-between border-b border-border/40 pb-2 mb-2">
                                <div className="flex items-center gap-2">
                                    <Layers className="h-4 w-4 text-purple-500" />
                                    <span className="font-semibold text-foreground text-xs">Queue Workers</span>
                                </div>
                                <span className="text-[9px] font-medium px-1 bg-purple-500/10 text-purple-600 rounded">1x Active</span>
                            </div>
                            <div className="space-y-1.5 text-[11px] text-muted-foreground">
                                <div className="flex justify-between">
                                    <span>Artisan command</span>
                                    <span className="font-mono text-foreground text-[10px]">queue:work</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Memory Limit</span>
                                    <span className="font-medium text-foreground">128 MiB</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* GUTTER 2: CONNECTOR LINES */}
                    <div className="hidden md:flex w-[8%] items-center justify-center relative">
                        <svg className="w-full h-48 overflow-visible pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="grad-resources" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
                                    <stop offset="50%" stopColor="#a855f7" stopOpacity="0.8" />
                                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
                                </linearGradient>
                            </defs>
                            <path d="M 0,50 L 50,50 L 50,20 L 100,20 M 50,50 L 50,50 L 50,50 L 100,50 M 50,50 L 50,80 L 100,80" stroke="url(#grad-resources)" strokeWidth="1.5" fill="none" />
                            {/* Animated Pulse Dot */}
                            <circle cx="50" cy="50" r="3.5" className="fill-purple-500" />
                            <circle cx="50" cy="50" r="7" className="stroke-purple-500/50 fill-none stroke-2 animate-ping" />
                        </svg>
                    </div>

                    {/* COLUMN 3: ATTACHED RESOURCES */}
                    <div className="w-full md:w-[28%] bg-muted/20 dark:bg-neutral-900/30 border border-border/40 rounded-2xl p-5 flex flex-col gap-4 relative">
                        <div className="flex items-center justify-between border-b border-border/30 pb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Resources</span>
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0.5 border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400">
                                Connected
                            </Badge>
                        </div>

                        {/* Database (PostgreSQL) */}
                        <div className="group rounded-xl border border-border bg-card p-3 transition-all duration-300 hover:border-emerald-500/50 hover:shadow-md hover:shadow-emerald-500/5">
                            <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-1.5">
                                    <Database className="h-3.5 w-3.5 text-emerald-500" />
                                    <span className="font-semibold text-foreground text-[11px]">primary-db</span>
                                </div>
                                <span className="text-[9px] px-1 text-emerald-600 bg-emerald-500/10 rounded">PostgreSQL</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground">10 GB Storage • AP Singapore</p>
                        </div>

                        {/* Cache (Redis) */}
                        <div className="group rounded-xl border border-border bg-card p-3 transition-all duration-300 hover:border-emerald-500/50 hover:shadow-md hover:shadow-emerald-500/5">
                            <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-1.5">
                                    <Server className="h-3.5 w-3.5 text-emerald-500" />
                                    <span className="font-semibold text-foreground text-[11px]">cache-redis</span>
                                </div>
                                <span className="text-[9px] px-1 text-emerald-600 bg-emerald-500/10 rounded">Redis 7.2</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground">256 MB RAM • In-Memory Cache</p>
                        </div>

                        {/* Storage (S3 Bucket) */}
                        <div className="group rounded-xl border border-border bg-card p-3 transition-all duration-300 hover:border-emerald-500/50 hover:shadow-md hover:shadow-emerald-500/5">
                            <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-1.5">
                                    <HardDrive className="h-3.5 w-3.5 text-emerald-500" />
                                    <span className="font-semibold text-foreground text-[11px]">uploads-bucket</span>
                                </div>
                                <span className="text-[9px] px-1 text-emerald-600 bg-emerald-500/10 rounded">R2 Bucket</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground">S3-Compatible Object Store</p>
                        </div>

                        {/* Add Resource Action Card */}
                        <Button variant="outline" size="sm" className="w-full border-dashed text-xs h-9 justify-center gap-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/30">
                            <Plus className="h-3.5 w-3.5" />
                            Attach Resource
                        </Button>
                    </div>

                </div>
            </div>

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
        </>
    );
}

Overview.layout = (props: any) => [
    [
        AppLayout,
        {
            breadcrumbs: [
                {
                    title: 'Dashboard',
                    href: props.currentTeam ? `/${props.currentTeam.slug}/dashboard` : '/',
                },
                {
                    title: 'Applications',
                    href: props.currentTeam ? `/${props.currentTeam.slug}/applications` : '#',
                },
                {
                    title: 'Overview',
                    href: '#',
                },
            ],
        },
    ],
    [
        ApplicationLayout,
        {
            applicationName: 'laravel-starter',
            environment: 'production',
            status: 'live',
        },
    ],
];
