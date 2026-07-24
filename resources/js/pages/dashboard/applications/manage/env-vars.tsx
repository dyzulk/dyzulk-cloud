import { Head } from '@inertiajs/react';
import { Eye, EyeOff, Plus, Save, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import ApplicationLayout from '@/layouts/app/application-layout';

export default function EnvVars() {
    const [showSecrets, setShowSecrets] = useState(false);

    const [envList] = useState([
        { key: 'APP_ENV', value: 'production', secret: false },
        { key: 'APP_DEBUG', value: 'false', secret: false },
        { key: 'APP_KEY', value: 'base64:7f9a2c3b4d5e6f1a8b9c0d1e2f3a4b5c=', secret: true },
        { key: 'DB_CONNECTION', value: 'pgsql', secret: false },
        { key: 'DB_HOST', value: 'primary-db.internal', secret: false },
        { key: 'REDIS_HOST', value: 'cache-redis.internal', secret: false },
    ]);

    return (
        <>
            <Head title="Environment Variables - laravel-starter" />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between border-b border-border/60 pb-5">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-foreground">
                            Environment Variables
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            Secrets and configuration parameters injected into the runtime container at startup.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowSecrets(!showSecrets)}
                            className="gap-1.5 text-xs"
                        >
                            {showSecrets ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            {showSecrets ? 'Hide Secrets' : 'Show Secrets'}
                        </Button>
                        <Button size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white">
                            <Save className="h-3.5 w-3.5" />
                            Save Changes
                        </Button>
                    </div>
                </div>

                <Card className="border-border/80 shadow-xs">
                    <CardHeader className="border-b border-border/40 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-semibold">
                                    Variables & Secrets
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Key-value pairs accessible via env() in your Laravel application.
                                </CardDescription>
                            </div>
                            <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
                                <Plus className="h-3.5 w-3.5" />
                                Add Variable
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-3">
                            {envList.map((item, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <Input
                                        value={item.key}
                                        readOnly
                                        className="h-9 w-1/3 font-mono text-xs font-semibold"
                                    />
                                    <Input
                                        type={item.secret && !showSecrets ? 'password' : 'text'}
                                        value={item.value}
                                        readOnly
                                        className="h-9 flex-1 font-mono text-xs"
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 text-muted-foreground hover:text-rose-500"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

EnvVars.layout = (props: any) => ({
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
            title: 'Environment Variables',
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
