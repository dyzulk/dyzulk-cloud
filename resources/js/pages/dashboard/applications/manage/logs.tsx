import { Head } from '@inertiajs/react';
import { Pause, Search, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import ApplicationLayout from '@/layouts/app/application-layout';
import AppLayout from '@/layouts/app-layout';

type Props = {
    application?: {
        id: number;
        name: string;
        environment: string;
        status: string;
    };
};

export default function Logs({ application }: Props) {
    const mockLogs = [
        { time: '09:50:12', level: 'INFO', message: '[PHP-FPM] worker 12 spawned successfully' },
        { time: '09:50:15', level: 'INFO', message: 'GET / 200 OK - 24ms (Inertia SSR rendered)' },
        { time: '09:50:22', level: 'INFO', message: 'GET /dashboard 200 OK - 32ms' },
        { time: '09:51:04', level: 'INFO', message: 'POST /api/v1/healthcheck 200 OK - 5ms' },
        { time: '09:51:40', level: 'WARN', message: '[Cache] Redis ping latency slightly higher than usual (12ms)' },
    ];

    const appName = application?.name || 'laravel-starter';

    return (
        <>
            <Head title={`Runtime Logs - ${appName}`} />

            {/* Filter & Actions Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3 flex-1">
                    <div className="relative flex-1 min-w-[200px] max-w-md">
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

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
                        <Pause className="h-3.5 w-3.5" />
                        Pause Stream
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 gap-1 text-xs text-rose-500 hover:text-rose-600">
                        <Trash2 className="h-3.5 w-3.5" />
                        Clear
                    </Button>
                </div>
            </div>

            {/* Log Stream Terminal */}
            <Card className="border-border/80 bg-neutral-950 text-neutral-100 shadow-xs">
                <CardHeader className="border-b border-neutral-800 px-6 py-3 flex flex-row items-center justify-between">
                    <span className="font-mono text-xs text-neutral-400">stdout.log</span>
                    <Badge variant="outline" className="border-emerald-500/30 text-[10px] text-emerald-400 animate-pulse">
                        Live Streaming
                    </Badge>
                </CardHeader>
                <CardContent className="p-6 font-mono text-xs">
                    <div className="space-y-1.5 leading-relaxed">
                        {mockLogs.map((log, idx) => (
                            <div key={idx} className="flex items-start space-x-2">
                                <span className="text-neutral-500 shrink-0 select-none">
                                    [{log.time}]
                                </span>
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
        </>
    );
}

Logs.layout = (props: any) => [
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
                    title: 'Logs',
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
