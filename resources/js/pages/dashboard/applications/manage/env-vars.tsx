import { Head } from '@inertiajs/react';
import { Eye, EyeOff, Plus, Save, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
    envVars?: Array<{
        id: number;
        key: string;
        value: string;
    }>;
};

export default function EnvVars({ application, envVars = [] }: Props) {
    const [showSecrets, setShowSecrets] = useState(false);

    const isSecret = (key: string) => {
        const k = key.toUpperCase();
        return k.includes('KEY') || k.includes('PASSWORD') || k.includes('SECRET') || k.includes('TOKEN');
    };

    const appName = application?.name || 'laravel-starter';

    return (
        <>
            <Head title={`Environment Variables - ${appName}`} />

            <Card className="border-border/80 shadow-xs">
                <CardHeader className="border-b border-border/40 px-6 py-4 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-base font-semibold">
                            Variables & Secrets
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Secrets and configuration parameters injected into the runtime container at startup.
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowSecrets(!showSecrets)}
                            className="h-8 gap-1.5 text-xs"
                        >
                            {showSecrets ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            {showSecrets ? 'Hide Secrets' : 'Show Secrets'}
                        </Button>
                        <Button size="sm" className="h-8 gap-1.5 bg-blue-600 hover:bg-blue-700 text-white">
                            <Save className="h-3.5 w-3.5" />
                            Save Changes
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="space-y-4">
                        <div className="flex gap-3 border-b border-border/60 pb-4">
                            <Input placeholder="KEY" className="h-9 font-mono text-xs max-w-[240px]" />
                            <Input placeholder="VALUE" className="h-9 font-mono text-xs" />
                            <Button variant="outline" size="sm" className="h-9 gap-1 text-xs">
                                <Plus className="h-3.5 w-3.5" />
                                Add
                            </Button>
                        </div>

                        <div className="space-y-3 pt-2">
                            {envVars.length > 0 ? (
                                envVars.map((item) => (
                                    <div key={item.id || item.key} className="flex gap-3">
                                        <Input
                                            value={item.key}
                                            readOnly
                                            className="h-9 font-mono text-xs max-w-[240px] bg-muted/30"
                                        />
                                        <Input
                                            type={isSecret(item.key) && !showSecrets ? 'password' : 'text'}
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
                                ))
                            ) : (
                                <div className="text-center py-6 text-muted-foreground text-xs">
                                    No environment variables configured.
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}

EnvVars.layout = (props: any) => [
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
                    title: 'Environment Variables',
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
