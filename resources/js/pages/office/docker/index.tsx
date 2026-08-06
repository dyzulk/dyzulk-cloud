import { Head } from '@inertiajs/react';
import {
    Activity,
    Box,
    Boxes,
    Container,
    Plus,
    RefreshCw,
    Server,
} from 'lucide-react';
import { index } from '@/actions/App/Http/Controllers/Office/DockerController';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { getRelativeUrl } from '@/lib/utils';

export default function DockerIndex() {
    return (
        <>
            <Head title="Docker Management" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 font-base">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Heading
                        title="Docker Management"
                        description="Monitor and manage containerized services, stacks, and infrastructure."
                    />
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="gap-2">
                            <RefreshCw className="h-4 w-4" />
                            Refresh Status
                        </Button>
                        <Button size="sm" className="gap-2">
                            <Plus className="h-4 w-4" />
                            Deploy Container
                        </Button>
                    </div>
                </div>

                {/* KPI Cards Row */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Containers
                            </CardTitle>
                            <Container className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">0</div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Active instances
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Active Stacks
                            </CardTitle>
                            <Boxes className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">0</div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Composed stacks
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Engine Status
                            </CardTitle>
                            <Server className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                                    Ready
                                </Badge>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Docker Daemon active
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                System Load
                            </CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">Normal</div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                CPU &amp; Memory usage
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Area */}
                <div className="grid flex-1 gap-4 md:grid-cols-7">
                    <Card className="relative col-span-5 flex min-h-[380px] flex-col overflow-hidden">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Box className="h-5 w-5" />
                                Container List
                            </CardTitle>
                            <CardDescription>
                                Overview of running and stopped Docker containers.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="relative m-6 flex-1 rounded-base border-2 border-border bg-secondary-background">
                            <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                            <div className="relative z-10 flex h-full flex-col items-center justify-center p-6 text-center">
                                <Container className="h-12 w-12 text-muted-foreground/60 mb-3" />
                                <h3 className="text-lg font-semibold">
                                    No Docker Containers Found
                                </h3>
                                <p className="mt-1 text-sm text-muted-foreground max-w-md">
                                    Containers and Docker compose stacks managed by Office Dashboard will be displayed here.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="col-span-2">
                        <CardHeader>
                            <CardTitle>Docker Host Info</CardTitle>
                            <CardDescription>
                                Environment details
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-muted-foreground">Environment</span>
                                <span className="font-medium">Production</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-muted-foreground">Driver</span>
                                <span className="font-medium">overlay2</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-muted-foreground">Socket Path</span>
                                <span className="font-mono text-xs font-medium">/var/run/docker.sock</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-muted-foreground">Auto-update</span>
                                <span className="font-medium">Disabled</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

DockerIndex.layout = {
    breadcrumbs: [
        {
            title: 'Docker Management',
            href: getRelativeUrl(index.url()),
        },
    ],
};
