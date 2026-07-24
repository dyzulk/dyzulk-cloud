import { Head } from '@inertiajs/react';
import { AlertTriangle, ExternalLink, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ApplicationLayout from '@/layouts/app/application-layout';

export default function Settings() {
    return (
        <>
            <Head title="Settings - laravel-starter" />

            <div className="flex flex-col gap-6 p-6">
                <div className="border-b border-border/60 pb-5">
                    <h1 className="text-xl font-bold tracking-tight text-foreground">
                        Application Settings
                    </h1>
                    <p className="text-xs text-muted-foreground">
                        Configure domains, Git repository linkage, build configuration, and application deletion.
                    </p>
                </div>

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
                                    value="laravel-starter-dyzulk.dyzulk.cloud"
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
                                    value="dyzulk/laravel-starter"
                                    readOnly
                                    className="font-mono text-xs"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-medium">Production Branch</Label>
                                <Input
                                    defaultValue="main"
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
            </div>
        </>
    );
}

Settings.layout = (props: any) => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: props.currentTeam ? `/${props.currentTeam.slug}/dashboard` : '/',
        },
        {
            title: 'laravel-starter',
            href: props.currentTeam ? `/${props.currentTeam.slug}/applications/laravel-starter/overview` : '#',
        },
        {
            title: 'Settings',
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
