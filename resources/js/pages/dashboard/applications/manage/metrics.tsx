import { Head } from '@inertiajs/react';
import { Activity, Cpu, HardDrive, Network, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ApplicationLayout from '@/layouts/app/application-layout';
import AppLayout from '@/layouts/app-layout';

export default function Metrics() {
    return (
        <>
            <Head title="Metrics - laravel-starter" />

            {/* Stat Summary Cards */}

                {/* Stat Summary Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="border-border/80 p-4">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>CPU Usage</span>
                            <Cpu className="h-4 w-4 text-purple-500" />
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-foreground">12%</span>
                            <span className="text-[11px] text-emerald-500">Normal</span>
                        </div>
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <div className="h-full w-[12%] rounded-full bg-purple-500" />
                        </div>
                    </Card>

                    <Card className="border-border/80 p-4">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Memory (RAM)</span>
                            <HardDrive className="h-4 w-4 text-blue-500" />
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-foreground">148 MB</span>
                            <span className="text-[11px] text-muted-foreground">of 512 MB</span>
                        </div>
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <div className="h-full w-[29%] rounded-full bg-blue-500" />
                        </div>
                    </Card>

                    <Card className="border-border/80 p-4">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>HTTP Requests</span>
                            <Zap className="h-4 w-4 text-amber-500" />
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-foreground">42 rps</span>
                            <span className="text-[11px] text-emerald-500">99.9% 2xx</span>
                        </div>
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <div className="h-full w-[45%] rounded-full bg-amber-500" />
                        </div>
                    </Card>

                    <Card className="border-border/80 p-4">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Network Bandwidth</span>
                            <Network className="h-4 w-4 text-emerald-500" />
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-foreground">2.4 MB/s</span>
                            <span className="text-[11px] text-muted-foreground">Egress</span>
                        </div>
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <div className="h-full w-[20%] rounded-full bg-emerald-500" />
                        </div>
                    </Card>
                </div>

                {/* Metric Graph Placeholder Cards */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="border-border/80">
                        <CardHeader className="border-b border-border/40 px-6 py-4">
                            <CardTitle className="text-sm font-semibold">
                                CPU & Memory Utilization over time
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex h-56 items-center justify-center p-6 text-center text-xs text-muted-foreground">
                            <div className="space-y-1">
                                <Activity className="mx-auto h-8 w-8 text-muted-foreground/60" />
                                <p className="font-medium text-foreground">Live Telemetry Active</p>
                                <p>Aggregating worker CPU & Memory metrics every 5 seconds.</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/80">
                        <CardHeader className="border-b border-border/40 px-6 py-4">
                            <CardTitle className="text-sm font-semibold">
                                Response Time & HTTP Status Codes
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex h-56 items-center justify-center p-6 text-center text-xs text-muted-foreground">
                            <div className="space-y-1">
                                <Zap className="mx-auto h-8 w-8 text-muted-foreground/60" />
                                <p className="font-medium text-foreground">Average Latency: 22ms</p>
                                <p>P95 Latency: 45ms • P99 Latency: 88ms</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
        </>
    );
}

Metrics.layout = (props: any) => [
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
                    title: 'Metrics',
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
