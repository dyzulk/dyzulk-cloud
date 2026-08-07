import { Cpu, HardDrive, MemoryStick, Clock, Globe, Container, Server as ServerIcon, Trash2, RefreshCw } from 'lucide-react';
import { router } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { destroy, setup } from '@/actions/App/Http/Controllers/Office/ServerController';
import { getRelativeUrl } from '@/lib/utils';
import type { ServerInstance } from '@/types/server';
import { getStatusConfig, getTypeConfig } from './server-grid-card';

interface ServerDetailSheetProps {
    server: ServerInstance | null;
    onClose: () => void;
}

function DetailRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
    return (
        <div className="flex items-center gap-3 py-2">
            <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-sm text-muted-foreground min-w-[100px]">{label}</span>
            <span className="text-sm font-medium ml-auto text-right">{value}</span>
        </div>
    );
}

function ResourceBar({ label, value }: { label: string; value: number }) {
    const textColor =
        value >= 80
            ? 'text-[oklch(0.577_0.245_27.325)]'
            : value >= 60
              ? 'text-[oklch(0.769_0.188_70.08)]'
              : 'text-[oklch(0.723_0.191_149.579)]';

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{label}</span>
                <span className={`font-bold font-mono ${textColor}`}>{value}%</span>
            </div>
            <Progress
                value={value}
                className="h-3 [&>[data-slot=progress-indicator]]:transition-all [&>[data-slot=progress-indicator]]:duration-700"
            />
        </div>
    );
}

const mockContainers = [
    { name: 'nginx-proxy', image: 'nginx:alpine', status: 'running', port: '80:80' },
    { name: 'app-laravel', image: 'dyzulk/app:latest', status: 'running', port: '8000:8000' },
    { name: 'redis-cache', image: 'redis:7-alpine', status: 'running', port: '6379:6379' },
    { name: 'pgsql-db', image: 'postgres:16', status: 'running', port: '5432:5432' },
];

export function ServerDetailSheet({ server, onClose }: ServerDetailSheetProps) {
    if (!server) return null;

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this server?')) {
            router.delete(getRelativeUrl(destroy.url(server.id)), {
                onSuccess: () => onClose(),
            });
        }
    };

    const handleSetup = () => {
        router.post(getRelativeUrl(setup.url(server.id)));
    };

    const status = server.connection_status || 'unknown';
    const cpu = server.telemetry?.cpu ?? (server.connection_status === 'online' ? 25 : 0);
    const memory = server.telemetry?.memory ?? (server.connection_status === 'online' ? 45 : 0);
    const disk = server.telemetry?.disk ?? (server.connection_status === 'online' ? 35 : 0);
    const os = server.validation_result?.os ?? 'Linux';
    const dockerVersion = server.validation_result?.docker_version ?? 'Pending';
    const role = server.type === 'node' ? 'Swarm Node' : 'Application Host';
    const uptime = server.telemetry?.uptime ?? 'N/A';

    const statusConfig = getStatusConfig(status);
    const typeConfig = getTypeConfig(server.type);

    return (
        <Sheet open={!!server} onOpenChange={(open) => !open && onClose()}>
            <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader className="pb-0">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-base border-2 border-border bg-secondary-background">
                            <ServerIcon className="h-6 w-6" />
                        </div>
                        <div className="min-w-0">
                            <SheetTitle className="text-lg">{server.name}</SheetTitle>
                            <SheetDescription className="font-mono text-xs">{server.host}</SheetDescription>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                        <Badge variant="outline" className={statusConfig.className}>
                            {statusConfig.label}
                        </Badge>
                        <Badge variant="outline" className={typeConfig.className}>
                            {typeConfig.label}
                        </Badge>
                    </div>
                </SheetHeader>

                <div className="space-y-6 px-4 pb-8">
                    {/* Resource Usage */}
                    <div>
                        <h4 className="text-sm font-bold font-heading mb-3">Resource Usage</h4>
                        <div className="space-y-3 rounded-base border-2 border-border bg-secondary-background/30 p-4">
                            <ResourceBar label="CPU" value={cpu} />
                            <ResourceBar label="Memory" value={memory} />
                            <ResourceBar label="Disk" value={disk} />
                        </div>
                    </div>

                    <Separator />

                    {/* System Information */}
                    <div>
                        <h4 className="text-sm font-bold font-heading mb-1">System Information</h4>
                        <div className="divide-y divide-border">
                            <DetailRow icon={Globe} label="IP Address" value={server.host} />
                            <DetailRow icon={Cpu} label="Operating System" value={os} />
                            <DetailRow icon={Container} label="Docker Version" value={dockerVersion} />
                            <DetailRow icon={MemoryStick} label="Role" value={role} />
                            <DetailRow icon={Clock} label="Uptime" value={uptime} />
                            <DetailRow icon={HardDrive} label="Hostname" value={server.host} />
                        </div>
                    </div>

                    <Separator />

                    {/* Mock Running Containers */}
                    <div>
                        <h4 className="text-sm font-bold font-heading mb-3">Running Containers</h4>
                        <div className="space-y-2">
                            {mockContainers.map((container) => (
                                <div
                                    key={container.name}
                                    className="flex items-center gap-3 rounded-base border-2 border-border bg-secondary-background/30 p-3"
                                >
                                    <Container className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <span className="block text-sm font-bold truncate">{container.name}</span>
                                        <span className="text-xs text-muted-foreground font-mono">{container.image}</span>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className="text-xs font-mono text-muted-foreground">{container.port}</span>
                                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    {/* Actions */}
                    <div className="flex flex-col gap-2 pt-2 pb-6">
                        <Button variant="default" className="w-full gap-2" onClick={handleSetup}>
                            <RefreshCw className="h-4 w-4" />
                            Run Setup & Provision
                        </Button>
                        <Button
                            variant="destructive"
                            className="w-full gap-2 border-2 border-destructive bg-destructive/15 text-destructive hover:bg-destructive/30"
                            onClick={handleDelete}
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete Server
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
