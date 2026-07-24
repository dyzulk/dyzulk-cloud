import { Head } from '@inertiajs/react';
import { CheckCircle2, Clock, GitCommit, Rocket, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ApplicationLayout from '@/layouts/app/application-layout';

export default function Deployments() {
    const deploymentsList = [
        {
            id: 'dep_9f3a1b2',
            commit: 'a1b2c3d',
            message: 'Update application routes and sidebar layout',
            author: 'dyzulk',
            branch: 'main',
            status: 'success',
            duration: '42s',
            createdAt: '10 minutes ago',
        },
        {
            id: 'dep_4e8c9d0',
            commit: 'e8c9d0f',
            message: 'Configure Inertia v3 SSR bundler and Wayfinder',
            author: 'dyzulk',
            branch: 'main',
            status: 'success',
            duration: '38s',
            createdAt: '1 hour ago',
        },
        {
            id: 'dep_1a2b3c4',
            commit: 'f5e4d3c',
            message: 'Fix Tailwind CSS v4 custom theme color variables',
            author: 'dyzulk',
            branch: 'main',
            status: 'success',
            duration: '45s',
            createdAt: '3 hours ago',
        },
        {
            id: 'dep_0z9y8x7',
            commit: 'c3b2a10',
            message: 'Add Redis cache connection string validation',
            author: 'dyzulk',
            branch: 'feature/redis',
            status: 'failed',
            duration: '12s',
            createdAt: '5 hours ago',
        },
    ];

    return (
        <>
            <Head title="Deployments - laravel-starter" />

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
                        {deploymentsList.map((dep) => (
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
                                            {dep.message}
                                        </div>
                                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                                            <span className="flex items-center gap-1 font-mono">
                                                <GitCommit className="h-3 w-3" />
                                                {dep.commit}
                                            </span>
                                            <span>•</span>
                                            <span className="font-mono">{dep.branch}</span>
                                            <span>•</span>
                                            <span>by {dep.author}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between gap-4 md:justify-end">
                                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {dep.duration}
                                        </span>
                                        <span>•</span>
                                        <span>{dep.createdAt}</span>
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
                        ))}
                    </div>
                </CardContent>
            </Card>
        </>
    );
}

Deployments.layout = (props: any) => ({
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
