import { Head } from '@inertiajs/react';
import { Database, HardDrive, Plus, Server } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ApplicationLayout from '@/layouts/app/application-layout';
import AppLayout from '@/layouts/app-layout';

type Props = {
    application?: {
        id: number;
        name: string;
        environment: string;
        status: string;
    };
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

export default function Resources({ application, resources = [] }: Props) {
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

    const appName = application?.name || 'laravel-starter';

    return (
        <>
            <Head title={`Resources - ${appName}`} />

            <div className="flex justify-end mb-4">
                <Button size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="h-3.5 w-3.5" />
                    Attach Resource
                </Button>
            </div>

            {resources.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-3">
                    {resources.map((res) => {
                        const Icon = getResourceIcon(res.type);

                        return (
                            <Card key={res.id || res.name} className="border-border/80 p-5 shadow-xs transition-all hover:border-primary/40">
                                <div className="flex items-center justify-between">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-[11px] text-emerald-600">
                                        Connected
                                    </Badge>
                                </div>
                                <div className="mt-4">
                                    <h3 className="font-semibold text-foreground text-sm">{res.name}</h3>
                                    <p className="text-xs font-medium text-muted-foreground">{getResourceLabel(res.type)}</p>
                                    <p className="mt-2 text-[11px] text-muted-foreground">{getResourceDetails(res)}</p>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/10 p-8 text-center">
                    <Database className="h-8 w-8 text-muted-foreground/60 mb-3" />
                    <p className="text-sm text-muted-foreground">
                        No resources attached to this application.
                    </p>
                </div>
            )}
        </>
    );
}

Resources.layout = (props: any) => [
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
                    title: 'Resources',
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
