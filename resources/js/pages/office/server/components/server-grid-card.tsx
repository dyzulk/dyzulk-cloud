import { Cpu, HardDrive, MemoryStick, Clock, Server } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { ServerInstance } from '@/types/server';

interface ServerGridCardProps {
    server: ServerInstance;
    onClick: (server: ServerInstance) => void;
}

function MetricGauge({ value, label, color }: { value: number; label: string; color: string }) {
    const radius = 32;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div className="flex flex-col items-center gap-1">
            <div className="relative h-[76px] w-[76px]">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 76 76">
                    <circle
                        cx="38"
                        cy="38"
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        className="text-secondary-background"
                        strokeWidth="6"
                    />
                    <circle
                        cx="38"
                        cy="38"
                        r={radius}
                        fill="none"
                        stroke={color}
                        strokeWidth="6"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className="transition-all duration-700 ease-in-out"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold font-heading">{value}%</span>
                </div>
            </div>
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
        </div>
    );
}

function getStatusConfig(status: string) {
    switch (status) {
        case 'online':
            return { label: 'Online', className: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' };
        case 'active':
            return { label: 'Active', className: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30' };
        case 'idle':
            return { label: 'Idle', className: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30' };
        case 'building':
            return { label: 'Building', className: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30' };
        case 'offline':
            return { label: 'Offline', className: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30' };
        default:
            return { label: status, className: '' };
    }
}

function getTypeConfig(type: string) {
    switch (type) {
        case 'local':
            return { label: 'Local', className: 'bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30' };
        case 'build':
            return { label: 'Build', className: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30' };
        case 'node':
            return { label: 'Cluster', className: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30' };
        case 'deploy':
            return { label: 'Deploy', className: 'bg-pink-500/15 text-pink-600 dark:text-pink-400 border-pink-500/30' };
        default:
            return { label: type, className: '' };
    }
}

function getGaugeColor(value: number): string {
    if (value >= 80) return 'oklch(0.577 0.245 27.325)';
    if (value >= 60) return 'oklch(0.769 0.188 70.08)';
    return 'oklch(0.723 0.191 149.579)';
}

export function ServerGridCard({ server, onClick }: ServerGridCardProps) {
    const statusConfig = getStatusConfig(server.status);
    const typeConfig = getTypeConfig(server.type);

    return (
        <Card
            className="group cursor-pointer transition-all duration-200 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            onClick={() => onClick(server)}
        >
            <CardHeader className="flex flex-row items-start justify-between gap-2 pb-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-base border-2 border-border bg-secondary-background">
                        <Server className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-sm font-bold font-heading truncate">{server.name}</h3>
                        <p className="text-xs text-muted-foreground truncate font-mono">{server.host}</p>
                    </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <Badge variant="outline" className={statusConfig.className}>
                        {statusConfig.label}
                    </Badge>
                    <Badge variant="outline" className={typeConfig.className}>
                        {typeConfig.label}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-0">
                {/* Resource Gauges */}
                <div className="flex items-center justify-around rounded-base border-2 border-border bg-secondary-background/50 px-2 py-4">
                    <MetricGauge value={server.cpu} label="CPU" color={getGaugeColor(server.cpu)} />
                    <MetricGauge value={server.memory} label="RAM" color={getGaugeColor(server.memory)} />
                    <MetricGauge value={server.disk} label="Disk" color={getGaugeColor(server.disk)} />
                </div>

                {/* Server Info Footer */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        <Cpu className="h-3 w-3 shrink-0" />
                        <span className="truncate">{server.os}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <MemoryStick className="h-3 w-3 shrink-0" />
                        <span>Docker {server.docker_version}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <HardDrive className="h-3 w-3 shrink-0" />
                        <span className="font-mono">{server.ip}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3 shrink-0" />
                        <span className="truncate">{server.uptime}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export { getStatusConfig, getTypeConfig };
