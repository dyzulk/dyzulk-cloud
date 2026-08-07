import { useState, useEffect, useCallback, useMemo } from 'react';
import type { ServerInstance, ServerType } from '@/types/server';

export type ViewMode = 'grid' | 'list';

export function useServers(initialServers: ServerInstance[]) {
    const [servers, setServers] = useState<ServerInstance[]>(initialServers);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | ServerType>('all');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [selectedServer, setSelectedServer] = useState<ServerInstance | null>(null);

    // Simulate real-time telemetry fluctuation
    useEffect(() => {
        const interval = setInterval(() => {
            setServers((prev) =>
                prev.map((server) => {
                    if (server.status === 'offline') return server;

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
                server.ip.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesFilter && matchesSearch;
        });
    }, [servers, activeFilter, searchQuery]);

    const aggregateStats = useMemo(() => {
        const onlineCount = servers.filter((s) => s.status !== 'offline').length;
        const avgCpu = onlineCount > 0
            ? Math.round(servers.reduce((sum, s) => sum + (s.status !== 'offline' ? s.cpu : 0), 0) / onlineCount)
            : 0;
        const avgMemory = onlineCount > 0
            ? Math.round(servers.reduce((sum, s) => sum + (s.status !== 'offline' ? s.memory : 0), 0) / onlineCount)
            : 0;
        const avgDisk = onlineCount > 0
            ? Math.round(servers.reduce((sum, s) => sum + (s.status !== 'offline' ? s.disk : 0), 0) / onlineCount)
            : 0;

        return { onlineCount, totalCount: servers.length, avgCpu, avgMemory, avgDisk };
    }, [servers]);

    const openDetail = useCallback((server: ServerInstance) => {
        setSelectedServer(server);
    }, []);

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
