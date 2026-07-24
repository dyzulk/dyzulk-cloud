import { Head } from '@inertiajs/react';
import { AlertTriangle, ExternalLink, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ApplicationLayout from '@/layouts/app/application-layout';
import AppLayout from '@/layouts/app-layout';

type Props = {
    application?: {
        id: number;
        name: string;
        environment: string;
        status: string;
        repository_name?: string;
        branch?: string;
        domains?: Array<{
            id: number;
            domain: string;
            is_primary: boolean;
        }>;
    };
};

export default function Settings({ application }: Props) {
    const appName = application?.name || 'laravel-starter';
    const repoName = application?.repository_name || 'dyzulk/laravel-starter';
    const branchName = application?.branch || 'main';

    const defaultCloudDomain = application?.domains?.find(d => !d.is_primary)?.domain 
        || `${appName}-dyzulk.dyzulk.cloud`;

    return (
        <>
            <Head title={`Settings - ${appName}`} />

                {/* Domain Settings */}
                <Card className="border-border/80 shadow-xs">
                    <CardHeader className="border-b border-border/40 px-6 py-4">
                        <CardTitle className="text-base font-semibold">
                            Domains & Routing
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Manage default cloud domain and add custom SSL-secured domains.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 p-6">
                        <div className="space-y-2">
                            <Label className="text-xs font-medium">Default Cloud Domain</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    value={defaultCloudDomain}
                                    readOnly
                                    className="font-mono text-xs"
                                />
                                <Button variant="outline" size="sm" className="gap-1 text-xs">
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    Visit
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-medium">Custom Domain</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    placeholder="app.yourdomain.com"
                                    className="font-mono text-xs"
                                />
                                <Button variant="outline" size="sm" className="text-xs">
                                    Connect Domain
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Build & Git Repo Settings */}
                <Card className="border-border/80 shadow-xs">
                    <CardHeader className="border-b border-border/40 px-6 py-4">
                        <CardTitle className="text-base font-semibold">
                            Git Repository & Build Branch
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Repository and branch monitored for automatic deployment triggers.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 p-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label className="text-xs font-medium">GitHub Repository</Label>
                                <Input
                                    value={repoName}
                                    readOnly
                                    className="font-mono text-xs"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-medium">Production Branch</Label>
                                <Input
                                    defaultValue={branchName}
                                    className="font-mono text-xs"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="border-rose-500/30 bg-rose-500/5 shadow-xs">
                    <CardHeader className="border-b border-rose-500/20 px-6 py-4">
                        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                            <AlertTriangle className="h-4 w-4" />
                            <CardTitle className="text-base font-semibold">
                                Danger Zone
                            </CardTitle>
                        </div>
                        <CardDescription className="text-xs text-rose-600/80 dark:text-rose-400/80">
                            Irreversible actions for this application service.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between p-6">
                        <div>
                            <h4 className="text-xs font-semibold text-foreground">
                                Delete Application
                            </h4>
                            <p className="text-[11px] text-muted-foreground">
                                Permanently remove this application service, deployment history, and environment variables.
                            </p>
                        </div>
                        <Button variant="destructive" size="sm" className="gap-1.5 text-xs">
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete Service
                        </Button>
                    </CardContent>
                </Card>
        </>
    );
}

Settings.layout = (props: any) => [
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
                    title: 'Settings',
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
