import { Head } from '@inertiajs/react';
import { Pause, Search, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import ApplicationLayout from '@/layouts/app/application-layout';

export default function Logs() {
    const mockLogs = [
        { time: '09:50:12', level: 'INFO', message: '[PHP-FPM] worker 12 spawned successfully' },
        { time: '09:50:15', level: 'INFO', message: 'GET / 200 OK - 24ms (Inertia SSR rendered)' },
        { time: '09:50:22', level: 'INFO', message: 'GET /dashboard 200 OK - 32ms' },
        { time: '09:51:04', level: 'INFO', message: 'POST /api/v1/healthcheck 200 OK - 5ms' },
        { time: '09:51:40', level: 'WARN', message: '[Cache] Redis ping latency slightly higher than usual (12ms)' },
    ];

    return (
        <>
            <Head title="Runtime Logs - laravel-starter" />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between border-b border-border/60 pb-5">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-foreground">
                            Runtime Logs
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            Live streaming stdout and stderr logs from application workers.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="gap-1 text-xs">
                            <Pause className="h-3.5 w-3.5" />
                            Pause Stream
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1 text-xs text-rose-500 hover:text-rose-600">
                            <Trash2 className="h-3.5 w-3.5" />
                            Clear
                        </Button>
                    </div>
                </div>

                {/* Filter Toolbar */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            placeholder="Filter log output..."
                            className="pl-8 h-8 text-xs"
                        />
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Badge variant="secondary" className="cursor-pointer text-[11px]">
                            All
                        </Badge>
                        <Badge variant="outline" className="cursor-pointer text-[11px] text-blue-500">
                            Info
                        </Badge>
                        <Badge variant="outline" className="cursor-pointer text-[11px] text-amber-500">
                            Warnings
                        </Badge>
                        <Badge variant="outline" className="cursor-pointer text-[11px] text-rose-500">
                            Errors
                        </Badge>
                    </div>
                </div>

                {/* Log Terminal Window */}
                <Card className="overflow-hidden border-border/80 bg-neutral-950 text-neutral-100 shadow-xs">
                    <CardHeader className="border-b border-neutral-800 px-6 py-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="font-mono text-xs text-neutral-400">
                                    stdout / stderr (live)
                                </span>
                            </div>
                            <span className="font-mono text-[11px] text-neutral-500">
                                Showing 6 events
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 font-mono text-xs leading-relaxed">
                        <div className="space-y-1.5">
                            {mockLogs.map((log, index) => (
                                <div key={index} className="flex items-start gap-3 hover:bg-neutral-900/60 p-1 rounded">
                                    <span className="text-neutral-500 shrink-0">{log.time}</span>
                                    <span
                                        className={
                                            log.level === 'WARN'
                                                ? 'text-amber-400 font-semibold shrink-0'
                                                : 'text-blue-400 font-semibold shrink-0'
                                        }
                                    >
                                        [{log.level}]
                                    </span>
                                    <span className="text-neutral-200">{log.message}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Logs.layout = (props: any) => ({
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
            title: 'Logs',
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
