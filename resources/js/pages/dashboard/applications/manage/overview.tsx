import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowUpRight,
    CheckCircle2,
    Cpu,
    Database,
    Globe,
    HardDrive,
    Layers,
    Lock,
    Plus,
    Server,
    Shield,
    XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
        deployments?: Array<{
            id: number;
            commit_sha: string;
            commit_message: string;
            branch: string;
            status: string;
            created_at: string;
        }>;
        domains?: Array<{
            id: number;
            domain: string;
            is_primary: boolean;
            status: string;
        }>;
        resources?: Array<{
            id: number;
            name: string;
            type: string;
            status: string;
            connection_details?: {
                host?: string;
                port?: number;
                database?: string;
                bucket?: string;
            };
        }>;
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
        deployments: [],
        domains: [],
        resources: [],
    };

    const getResourceIcon = (type: string) => {
        switch (type) {
            case 'postgresql':
                return Database;
            case 'redis':
            case 'valkey':
                return Server;
            default:
                return HardDrive;
        }
    };

    const getResourceLabel = (type: string) => {
        switch (type) {
            case 'postgresql':
                return 'PostgreSQL';
            case 'redis':
                return 'Redis';
            case 'valkey':
                return 'Valkey';
            case 's3':
                return 'R2 Bucket';
            default:
                return type.toUpperCase();
        }
    };

    const getResourceDetails = (res: any) => {
        if (res.type === 'postgresql') {
            return `Port ${res.connection_details?.port || 5432} • ${res.connection_details?.database || 'db'}`;
        }

        if (res.type === 'redis' || res.type === 'valkey') {
            return `Port ${res.connection_details?.port || 6379} • In-Memory`;
        }

        if (res.type === 's3') {
            return `${res.connection_details?.bucket || 'bucket'} • Object Store`;
        }

        return 'Connected resource';
    };

    return (
        <>
            <Head title={`${appData.name} - Overview`} />

            {/* Network & Architecture Topology Diagram */}
            <div className="relative w-full rounded-base border-2 border-border bg-secondary-background p-6 md:p-8 overflow-hidden shadow-shadow">
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] text-foreground/20 bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

                <div className="flex flex-col md:flex-row items-stretch justify-between gap-4 md:gap-0 relative z-10">
                    
                    {/* COLUMN 1: EDGE NETWORK */}
                    <div className="w-full md:w-[28%] bg-background border-2 border-border rounded-base p-5 flex flex-col gap-4 relative">
                        <div className="flex items-center justify-between border-b border-border/30 pb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Edge Network</span>
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0.5 border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400">
                                Active
                            </Badge>
                        </div>

                        {/* CDN & Security Card */}
                        <div className="group rounded-base border-2 border-border bg-secondary-background p-4 shadow-shadow transition-all hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none">
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
                                {appData.domains && appData.domains.length > 0 ? (
                                    appData.domains.map((dom) => (
                                        <div key={dom.id} className="flex items-center justify-between">
                                            <span className="flex items-center gap-1">
                                                <Lock className="h-3 w-3 text-emerald-500" />
                                                {dom.domain}
                                            </span>
                                            {dom.is_primary && (
                                                <Badge variant="outline" className="text-[8px] scale-90 px-1 border-blue-500/20 bg-blue-500/5 text-blue-600">Primary</Badge>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-[10px] text-muted-foreground">No domains configured</div>
                                )}
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
                            <circle cx="50" cy="50" r="3.5" className="fill-blue-500" />
                        </svg>
                    </div>

                    {/* COLUMN 2: COMPUTE CLUSTER */}
                    <div className="w-full md:w-[28%] bg-background border-2 border-border rounded-base p-5 flex flex-col gap-4 relative">
                        <div className="flex items-center justify-between border-b border-border/30 pb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">App Cluster</span>
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0.5 border-purple-500/20 bg-purple-500/5 text-purple-600 dark:text-purple-400">
                                {appData.status === 'live' ? 'Live' : 'Active'}
                            </Badge>
                        </div>

                        {/* Web Instance Card */}
                        <div className="group rounded-base border-2 border-border bg-secondary-background p-4 shadow-shadow transition-all hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none">
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
                                    <span className="font-medium text-foreground">{appData.region}</span>
                                </div>
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
                        <div className="group rounded-base border-2 border-border bg-secondary-background p-4 shadow-shadow transition-all hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none">
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
                            <circle cx="50" cy="50" r="3.5" className="fill-purple-500" />
                        </svg>
                    </div>

                    {/* COLUMN 3: ATTACHED RESOURCES */}
                    <div className="w-full md:w-[28%] bg-background border-2 border-border rounded-base p-5 flex flex-col gap-4 relative">
                        <div className="flex items-center justify-between border-b border-border/30 pb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Resources</span>
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0.5 border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400">
                                Connected
                            </Badge>
                        </div>

                        {appData.resources && appData.resources.length > 0 ? (
                            appData.resources.map((res) => {
                                const Icon = getResourceIcon(res.type);

                                return (
                                    <div key={res.id} className="group rounded-base border-2 border-border bg-secondary-background p-3 shadow-shadow transition-all hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <div className="flex items-center gap-1.5">
                                                <Icon className="h-3.5 w-3.5 text-emerald-500" />
                                                <span className="font-semibold text-foreground text-[11px]">{res.name}</span>
                                            </div>
                                            <span className="text-[9px] px-1 text-emerald-600 bg-emerald-500/10 rounded">{getResourceLabel(res.type)}</span>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground">{getResourceDetails(res)}</p>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-[10px] text-muted-foreground py-2 text-center">No resources attached</div>
                        )}

                        <Button variant="outline" size="sm" className="w-full border-2 border-dashed text-xs h-9 justify-center gap-1.5">
                            <Plus className="h-3.5 w-3.5" />
                            Attach Resource
                        </Button>
                    </div>

                </div>
            </div>

            {/* Latest Deployments */}
            <Card className="border-2 border-border shadow-shadow rounded-base">
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
                        {appData.deployments && appData.deployments.length > 0 ? (
                            appData.deployments.map((dep) => (
                                <div key={dep.id} className="flex items-center justify-between p-4 hover:bg-muted/20">
                                    <div className="flex items-center gap-3">
                                        {dep.status === 'success' ? (
                                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                        ) : (
                                            <XCircle className="h-4 w-4 text-rose-500" />
                                        )}
                                        <div>
                                            <div className="font-medium text-foreground">
                                                {dep.commit_message || 'No commit message'}
                                            </div>
                                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                                <span className="font-mono">{dep.commit_sha ? dep.commit_sha.substring(0, 7) : 'N/A'}</span>
                                                <span>•</span>
                                                <span>{dep.branch} branch</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-right">
                                        <Badge
                                            variant="outline"
                                            className={
                                                dep.status === 'success'
                                                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600'
                                                    : 'border-rose-500/30 bg-rose-500/10 text-rose-600'
                                            }
                                        >
                                            {dep.status === 'success' ? 'Success' : 'Failed'}
                                        </Badge>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-muted-foreground text-center">No deployments found.</div>
                        )}
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
            applicationName: props.application?.name || 'laravel-starter',
            environment: props.application?.environment || 'production',
            status: props.application?.status || 'live',
        },
    ],
];
