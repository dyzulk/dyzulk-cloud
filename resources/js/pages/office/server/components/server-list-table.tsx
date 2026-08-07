import { Server as ServerIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import type { ServerInstance } from '@/types/server';
import { getStatusConfig, getTypeConfig } from './server-grid-card';

interface ServerListTableProps {
    servers: ServerInstance[];
    searchQuery: string;
    onClick: (server: ServerInstance) => void;
}

function MetricCell({ value, label }: { value: number; label: string }) {
    const color =
        value >= 80
            ? 'bg-[oklch(0.577_0.245_27.325)]'
            : value >= 60
              ? 'bg-[oklch(0.769_0.188_70.08)]'
              : 'bg-[oklch(0.723_0.191_149.579)]';

    return (
        <div className="flex items-center gap-2 min-w-[100px]">
            <Progress
                value={value}
                className="h-2.5 flex-1 [&>[data-slot=progress-indicator]]:transition-all [&>[data-slot=progress-indicator]]:duration-700"
                style={{ ['--progress-color' as string]: color }}
            />
            <span className="text-xs font-bold font-mono w-8 text-right">{value}%</span>
        </div>
    );
}

export function ServerListTable({ servers, searchQuery, onClick }: ServerListTableProps) {
    if (servers.length === 0) {
        return (
            <div className="flex min-h-[380px] items-center justify-center p-6">
                <Empty>
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <ServerIcon />
                        </EmptyMedia>
                        <EmptyTitle>No Servers Found</EmptyTitle>
                        <EmptyDescription>
                            {searchQuery
                                ? 'No servers match your search or filter criteria.'
                                : 'No servers have been registered yet.'}
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            </div>
        );
    }

    return (
        <Table>
            <TableHeader className="bg-secondary-background">
                <TableRow>
                    <TableHead className="font-bold border-b-2 border-border text-foreground">Server</TableHead>
                    <TableHead className="font-bold border-b-2 border-border text-foreground">IP / Host</TableHead>
                    <TableHead className="font-bold border-b-2 border-border text-foreground">Type</TableHead>
                    <TableHead className="font-bold border-b-2 border-border text-foreground">Status</TableHead>
                    <TableHead className="font-bold border-b-2 border-border text-foreground">CPU</TableHead>
                    <TableHead className="font-bold border-b-2 border-border text-foreground">Memory</TableHead>
                    <TableHead className="font-bold border-b-2 border-border text-foreground">Disk</TableHead>
                    <TableHead className="font-bold border-b-2 border-border text-foreground">Uptime</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {servers.map((server) => {
                    const statusConfig = getStatusConfig(server.status);
                    const typeConfig = getTypeConfig(server.type);

                    return (
                        <TableRow
                            key={server.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => onClick(server)}
                        >
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-base border-2 border-border bg-secondary-background">
                                        <ServerIcon className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <span className="block text-sm font-bold">{server.name}</span>
                                        <span className="text-xs text-muted-foreground">{server.role}</span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div>
                                    <span className="block text-xs font-mono">{server.ip}</span>
                                    <span className="text-xs text-muted-foreground truncate block max-w-[160px]">
                                        {server.host}
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className={typeConfig.className}>
                                    {typeConfig.label}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className={statusConfig.className}>
                                    {statusConfig.label}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <MetricCell value={server.cpu} label="CPU" />
                            </TableCell>
                            <TableCell>
                                <MetricCell value={server.memory} label="RAM" />
                            </TableCell>
                            <TableCell>
                                <MetricCell value={server.disk} label="Disk" />
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                {server.uptime}
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}
