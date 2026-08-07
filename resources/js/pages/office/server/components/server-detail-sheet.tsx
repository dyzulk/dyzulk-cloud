import { Cpu, HardDrive, MemoryStick, Clock, Globe, Container, Server as ServerIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
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

    const statusConfig = getStatusConfig(server.status);
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
                            <ResourceBar label="CPU" value={server.cpu} />
                            <ResourceBar label="Memory" value={server.memory} />
                            <ResourceBar label="Disk" value={server.disk} />
                        </div>
                    </div>

                    <Separator />

                    {/* System Information */}
                    <div>
                        <h4 className="text-sm font-bold font-heading mb-1">System Information</h4>
                        <div className="divide-y divide-border">
                            <DetailRow icon={Globe} label="IP Address" value={server.ip} />
                            <DetailRow icon={Cpu} label="Operating System" value={server.os} />
                            <DetailRow icon={Container} label="Docker Version" value={server.docker_version} />
                            <DetailRow icon={MemoryStick} label="Role" value={server.role} />
                            <DetailRow icon={Clock} label="Uptime" value={server.uptime} />
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
                </div>
            </SheetContent>
        </Sheet>
    );
}
