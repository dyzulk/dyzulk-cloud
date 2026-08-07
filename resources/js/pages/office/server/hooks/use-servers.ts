import { useState, useEffect, useCallback, useMemo } from 'react';
import type { ServerInstance, ServerType } from '@/types/server';

export type ViewMode = 'grid' | 'list';

export function useServers(initialServers: ServerInstance[]) {
    // Map database properties to UI structure
    const mapServers = useCallback((rawServers: ServerInstance[]): any[] => {
        return rawServers.map((server) => {
            const hasTelemetry = server.telemetry !== null;
            return {
                ...server,
                status: server.connection_status || 'unknown',
                ip: server.host,
                cpu: server.telemetry?.cpu ?? (server.connection_status === 'online' ? 25 : 0),
                memory: server.telemetry?.memory ?? (server.connection_status === 'online' ? 45 : 0),
                disk: server.telemetry?.disk ?? (server.connection_status === 'online' ? 35 : 0),
                role: server.type === 'node' ? 'Swarm Node' : 'Application Host',
                docker_version: server.validation_result?.docker_version ?? 'Pending',
                os: server.validation_result?.os ?? 'Linux',
                uptime: server.telemetry?.uptime ?? 'N/A',
            };
        });
    }, []);

    const [servers, setServers] = useState<any[]>(() => mapServers(initialServers));
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | ServerType>('all');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [selectedServer, setSelectedServer] = useState<ServerInstance | null>(null);

    // Keep state in sync with prop updates
    useEffect(() => {
        setServers(mapServers(initialServers));
    }, [initialServers, mapServers]);

    // Simulate real-time telemetry fluctuation for online servers
    useEffect(() => {
        const interval = setInterval(() => {
            setServers((prev) =>
                prev.map((server) => {
                    if (server.status !== 'online') return server;

                    const fluctuate = (value: number, range: number) => {
                        const delta = (Math.random() - 0.5) * 2 * range;
                        return Math.max(1, Math.min(99, Math.round(value + delta)));
                    };

                    return {
                        ...server,
                        cpu: fluctuate(server.cpu, 3),
                        memory: fluctuate(server.memory, 2),
                        disk: fluctuate(server.disk, 0.5),
                    };
                }),
            );
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const filteredServers = useMemo(() => {
        return servers.filter((server) => {
            const matchesFilter = activeFilter === 'all' || server.type === activeFilter;
            const matchesSearch =
                searchQuery === '' ||
                server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                server.host.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (server.ip && server.ip.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchesFilter && matchesSearch;
        });
    }, [servers, activeFilter, searchQuery]);

    const aggregateStats = useMemo(() => {
        const onlineCount = servers.filter((s) => s.status === 'online').length;
        const avgCpu = onlineCount > 0
            ? Math.round(servers.reduce((sum, s) => sum + (s.status === 'online' ? s.cpu : 0), 0) / onlineCount)
            : 0;
        const avgMemory = onlineCount > 0
            ? Math.round(servers.reduce((sum, s) => sum + (s.status === 'online' ? s.memory : 0), 0) / onlineCount)
            : 0;
        const avgDisk = onlineCount > 0
            ? Math.round(servers.reduce((sum, s) => sum + (s.status === 'online' ? s.disk : 0), 0) / onlineCount)
            : 0;

        return { onlineCount, totalCount: servers.length, avgCpu, avgMemory, avgDisk };
    }, [servers]);

    const openDetail = useCallback((server: any) => {
        // Find the raw server instance to pass to detail sheets
        const raw = initialServers.find((s) => s.id === server.id) || server;
        setSelectedServer(raw);
    }, [initialServers]);

    const closeDetail = useCallback(() => {
        setSelectedServer(null);
    }, []);

    return {
        servers,
        searchQuery,
        setSearchQuery,
        activeFilter,
        setActiveFilter,
        viewMode,
        setViewMode,
        selectedServer,
        openDetail,
        closeDetail,
        filteredServers,
        aggregateStats,
    };
}
