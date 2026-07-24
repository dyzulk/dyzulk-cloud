import { Head } from '@inertiajs/react';
import { Database, HardDrive, Plus, Server } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ApplicationLayout from '@/layouts/app/application-layout';

export default function Resources() {
    const attachedResources = [
        {
            name: 'primary-db',
            type: 'PostgreSQL 16',
            icon: Database,
            status: 'connected',
            details: '10 GB Storage • AP Singapore',
        },
        {
            name: 'cache-redis',
            type: 'Redis 7.2',
            icon: Server,
            status: 'connected',
            details: '256 MB Memory • In-Memory Cache',
        },
        {
            name: 'uploads-bucket',
            type: 'Cloudflare R2 Bucket',
            icon: HardDrive,
            status: 'connected',
            details: 'S3 API Compatible • Unlimited',
        },
    ];

    return (
        <>
            <Head title="Resources - laravel-starter" />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between border-b border-border/60 pb-5">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-foreground">
                            Resources & Databases
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            Manage managed databases, caches, and storage buckets attached to this service.
                        </p>
                    </div>

                    <Button size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="h-3.5 w-3.5" />
                        Attach Resource
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    {attachedResources.map((res) => (
                        <Card key={res.name} className="border-border/80 p-5 shadow-xs transition-all hover:border-primary/40">
                            <div className="flex items-center justify-between">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <res.icon className="h-5 w-5" />
                                </div>
                                <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-[11px] text-emerald-600">
                                    Connected
                                </Badge>
                            </div>
                            <div className="mt-4">
                                <h3 className="font-semibold text-foreground text-sm">{res.name}</h3>
                                <p className="text-xs font-medium text-muted-foreground">{res.type}</p>
                                <p className="mt-2 text-[11px] text-muted-foreground">{res.details}</p>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </>
    );
}

Resources.layout = (props: any) => ({
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
            title: 'Resources',
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
