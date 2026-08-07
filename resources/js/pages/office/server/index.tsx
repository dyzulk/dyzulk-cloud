import { Head } from '@inertiajs/react';
import { Server, RefreshCw, Cpu, HardDrive, ShieldCheck, Activity } from 'lucide-react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { getRelativeUrl } from '@/lib/utils';
import { index as serverIndex } from '@/actions/App/Http/Controllers/Office/ServerController';

export default function ServerIndex() {
    return (
        <>
            <Head title="Server Management" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 font-base">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Heading
                        title="Server Management"
                        description="Monitor and manage server hardware, system resources, and status."
                    />
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="gap-2">
                            <RefreshCw className="h-4 w-4" />
                            Refresh Status
                        </Button>
                    </div>
                </div>

                {/* KPI Cards Row */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">CPU Status</CardTitle>
                            <Cpu className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">Healthy</div>
                            <p className="mt-1 text-xs text-muted-foreground">0% average load</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">Healthy</div>
                            <p className="mt-1 text-xs text-muted-foreground">0% utilized</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Disk Space</CardTitle>
                            <HardDrive className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">Healthy</div>
                            <p className="mt-1 text-xs text-muted-foreground">0% utilized</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Security</CardTitle>
                            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                                    Secure
                                </Badge>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">Firewall active</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Area */}
                <div className="grid flex-1 gap-4 md:grid-cols-7">
                    <Card className="relative col-span-5 flex min-h-[380px] flex-col overflow-hidden">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Server className="h-5 w-5" />
                                Server Instances
                            </CardTitle>
                            <CardDescription>
                                Overview of server status and hardware nodes.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="relative m-6 flex-1 rounded-base border-2 border-border bg-secondary-background">
                            <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                            <div className="relative z-10 flex h-full flex-col items-center justify-center p-6 text-center">
                                <Server className="h-12 w-12 text-muted-foreground/60 mb-3" />
                                <h3 className="text-lg font-semibold">No Server Data Available</h3>
                                <p className="mt-1 text-sm text-muted-foreground max-w-md">
                                    Active system information and servers connected to the network will be displayed here.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="col-span-2">
                        <CardHeader>
                            <CardTitle>System Information</CardTitle>
                            <CardDescription>Details of the host environment.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-muted-foreground">Host OS</span>
                                <span className="font-medium">Linux</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-muted-foreground">Architecture</span>
                                <span className="font-medium">x86_64</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-muted-foreground">PHP Version</span>
                                <span className="font-medium">8.5</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-muted-foreground">Status</span>
                                <span className="font-medium text-emerald-600 dark:text-emerald-400">Online</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

ServerIndex.layout = {
    breadcrumbs: [
        {
            title: 'Server Management',
            href: getRelativeUrl(serverIndex.url()),
        },
    ],
};
