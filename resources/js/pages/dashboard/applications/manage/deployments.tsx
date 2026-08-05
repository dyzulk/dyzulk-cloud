import { Head } from '@inertiajs/react';
import { CheckCircle2, Clock, GitCommit, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ApplicationLayout from '@/layouts/app/application-layout';
import AppLayout from '@/layouts/app-layout';

type Props = {
    application?: {
        id: number;
        name: string;
        environment: string;
        status: string;
    };
    deployments?: {
        data: Array<{
            id: number;
            commit_sha: string;
            commit_message: string;
            commit_author: string;
            branch: string;
            status: string;
            started_at: string;
            finished_at: string;
            created_at: string;
        }>;
    };
};

export default function Deployments({ application, deployments }: Props) {
    const deploymentsList = deployments?.data || [];

    const getDuration = (started?: string, finished?: string) => {
        if (!started || !finished) {
return 'N/A';
}

        const start = new Date(started).getTime();
        const finish = new Date(finished).getTime();
        const diff = Math.round((finish - start) / 1000);

        return `${diff}s`;
    };

    const getFormattedTime = (timeStr?: string) => {
        if (!timeStr) {
return 'N/A';
}

        return new Date(timeStr).toLocaleString();
    };

    const appName = application?.name || 'laravel-starter';

    return (
        <>
            <Head title={`Deployments - ${appName}`} />

            <Card className="border-border/80 shadow-xs">
                <CardHeader className="border-b border-border/40 px-6 py-4">
                    <CardTitle className="text-base font-semibold">
                        Deployment History
                    </CardTitle>
                    <CardDescription className="text-xs">
                        All automatic git pushes and manual deployment triggers.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-border/40 text-xs">
                        {deploymentsList.length > 0 ? (
                            deploymentsList.map((dep) => (
                                <div
                                    key={dep.id}
                                    className="flex flex-col justify-between gap-3 p-4 transition-colors hover:bg-muted/20 md:flex-row md:items-center"
                                >
                                    <div className="flex items-start gap-3">
                                        {dep.status === 'success' ? (
                                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                                        ) : (
                                            <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                                        )}
                                        <div>
                                            <div className="font-medium text-foreground">
                                                {dep.commit_message || 'No commit message'}
                                            </div>
                                            <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                                                <span className="flex items-center gap-1 font-mono">
                                                    <GitCommit className="h-3 w-3" />
                                                    {dep.commit_sha ? dep.commit_sha.substring(0, 7) : 'N/A'}
                                                </span>
                                                <span>•</span>
                                                <span className="font-mono">{dep.branch}</span>
                                                <span>•</span>
                                                <span>by {dep.commit_author || 'System'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-4 md:justify-end">
                                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {getDuration(dep.started_at, dep.finished_at)}
                                            </span>
                                            <span>•</span>
                                            <span>{getFormattedTime(dep.created_at)}</span>
                                        </div>
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
                            <div className="p-8 text-center text-muted-foreground">
                                No deployments found.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </>
    );
}

Deployments.layout = (props: any) => [
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
                    title: 'Deployments',
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
