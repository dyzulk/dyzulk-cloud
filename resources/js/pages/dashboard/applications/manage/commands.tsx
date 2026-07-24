import { Head } from '@inertiajs/react';
import { Play, Terminal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import ApplicationLayout from '@/layouts/app/application-layout';
import AppLayout from '@/layouts/app-layout';

export default function Commands() {
    const commonCommands = [
        'php artisan migrate --force',
        'php artisan cache:clear',
        'php artisan config:cache',
        'php artisan route:cache',
        'php artisan queue:restart',
    ];

    return (
        <>
            <Head title="Commands - laravel-starter" />

            {/* Command Runner Form */}
            <Card className="border-border/80 shadow-xs">
                <CardHeader className="border-b border-border/40 px-6 py-4">
                    <CardTitle className="text-base font-semibold">
                        Run Artisan Command
                    </CardTitle>
                    <CardDescription className="text-xs">
                        Specify a command string to execute in the application container environment.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Terminal className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="php artisan migrate --force"
                                className="pl-9 font-mono text-xs"
                            />
                        </div>
                        <Button className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white">
                            <Play className="h-3.5 w-3.5" />
                            Execute
                        </Button>
                    </div>

                    {/* Quick Presets */}
                    <div className="space-y-2">
                        <span className="text-[11px] font-medium text-muted-foreground">
                            Quick presets:
                        </span>
                        <div className="flex flex-wrap gap-2">
                            {commonCommands.map((cmd) => (
                                <button
                                    key={cmd}
                                    type="button"
                                    className="rounded-md border border-border bg-muted/30 px-2.5 py-1 font-mono text-[10px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                >
                                    {cmd}
                                </button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Command Output Log */}
            <Card className="border-border/80 bg-neutral-950 text-neutral-200 dark:bg-neutral-900 shadow-xs">
                <CardHeader className="border-b border-neutral-800 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xs font-semibold text-neutral-400">
                            Terminal Console Output
                        </CardTitle>
                        <Badge variant="outline" className="border-emerald-500/30 text-[10px] text-emerald-400">
                            Idle
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-4 font-mono text-xs leading-relaxed text-neutral-300">
                    <p className="text-neutral-500">
                        # Select or enter an artisan command above to see output here.
                    </p>
                    <p className="mt-2 text-emerald-400">$ php artisan migrate --force</p>
                    <p>Nothing to migrate.</p>
                </CardContent>
            </Card>
        </>
    );
}

Commands.layout = (props: any) => [
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
                    title: 'Commands',
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
