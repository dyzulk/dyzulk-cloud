import { Head } from '@inertiajs/react';
import { useState } from 'react';
import {
    Server,
    Cpu,
    HardDrive,
    Activity,
    LayoutGrid,
    List,
    Search,
    MonitorDot,
    Plus,
} from 'lucide-react';
import { index as serverIndex } from '@/actions/App/Http/Controllers/Office/ServerController';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getRelativeUrl } from '@/lib/utils';
import type { ServerInstance, ServerType } from '@/types/server';
import type { SshKeyInstance } from '@/types/office';
import { ServerDetailSheet } from './components/server-detail-sheet';
import { ServerGridCard } from './components/server-grid-card';
import { ServerListTable } from './components/server-list-table';
import { AddServerDialog } from './components/add-server-dialog';
import { useServers } from './hooks/use-servers';

const typeFilters: { value: 'all' | ServerType; label: string }[] = [
    { value: 'all', label: 'All Servers' },
    { value: 'local', label: 'Local' },
    { value: 'build', label: 'Build' },
    { value: 'node', label: 'Cluster' },
    { value: 'deploy', label: 'Deploy' },
];

function KpiCard({
    title,
    value,
    subtitle,
    icon: Icon,
}: {
    title: string;
    value: string;
    subtitle: string;
    icon: React.ElementType;
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold font-heading">{value}</div>
                <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
            </CardContent>
        </Card>
    );
}

export default function ServerIndex({
    servers,
    sshKeys,
}: {
    servers: ServerInstance[];
    sshKeys: SshKeyInstance[];
}) {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const {
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
    } = useServers(servers);

    return (
        <>
            <Head title="Server Management" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 font-base">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Heading
                        title="Server Management"
                        description="Monitor and manage server hardware, system resources, and status."
                    />
                    <div className="flex items-center gap-3">
                        <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
                            <Plus className="h-4 w-4" />
                            Add Server
                        </Button>
                        <div className="flex items-center rounded-base border-2 border-border bg-background">
                            <Button
                                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                size="sm"
                                className="gap-1.5 rounded-r-none border-0"
                                onClick={() => setViewMode('grid')}
                            >
                                <LayoutGrid className="h-4 w-4" />
                                Grid
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'default' : 'ghost'}
                                size="sm"
                                className="gap-1.5 rounded-l-none border-0"
                                onClick={() => setViewMode('list')}
                            >
                                <List className="h-4 w-4" />
                                List
                            </Button>
                        </div>
                    </div>
                </div>

                {/* KPI Cards Row */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                    <KpiCard
                        title="Total Servers"
                        value={`${aggregateStats.onlineCount}/${aggregateStats.totalCount}`}
                        subtitle={`${aggregateStats.onlineCount} online`}
                        icon={MonitorDot}
                    />
                    <KpiCard
                        title="Avg. CPU Load"
                        value={`${aggregateStats.avgCpu}%`}
                        subtitle="across all active servers"
                        icon={Cpu}
                    />
                    <KpiCard
                        title="Avg. Memory"
                        value={`${aggregateStats.avgMemory}%`}
                        subtitle="average utilization"
                        icon={Activity}
                    />
                    <KpiCard
                        title="Avg. Disk"
                        value={`${aggregateStats.avgDisk}%`}
                        subtitle="storage consumed"
                        icon={HardDrive}
                    />
                </div>

                {/* Filters & Search Bar */}
                <Card className="flex flex-1 flex-col">
                    <CardHeader className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Server className="h-5 w-5" />
                                Server Instances
                            </CardTitle>
                            <CardDescription>
                                {filteredServers.length} server{filteredServers.length !== 1 ? 's' : ''} matching current filter
                            </CardDescription>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search servers..."
                                    className="pl-9 border-2 border-border"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>

                    {/* Type Filter Tabs */}
                    <div className="border-b border-border px-6 py-3">
                        <Tabs
                            value={activeFilter}
                            onValueChange={(value) => setActiveFilter(value as 'all' | ServerType)}
                        >
                            <TabsList>
                                {typeFilters.map((filter) => (
                                    <TabsTrigger key={filter.value} value={filter.value}>
                                        {filter.label}
                                        {filter.value === 'all' ? (
                                            <Badge variant="neutral" className="ml-1 h-5 px-1.5 text-[10px]">
                                                {servers.length}
                                            </Badge>
                                        ) : (
                                            <Badge variant="neutral" className="ml-1 h-5 px-1.5 text-[10px]">
                                                {servers.filter((s) => s.type === filter.value).length}
                                            </Badge>
                                        )}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>
                    </div>

                    {/* Content Area */}
                    <CardContent className="flex-1 p-0">
                        {viewMode === 'grid' ? (
                            filteredServers.length === 0 ? (
                                <div className="flex min-h-[380px] items-center justify-center p-6">
                                    <div className="text-center">
                                        <Server className="mx-auto h-12 w-12 text-muted-foreground/60 mb-3" />
                                        <h3 className="text-lg font-semibold font-heading">No Servers Found</h3>
                                        <p className="mt-1 text-sm text-muted-foreground max-w-md">
                                            {searchQuery
                                                ? 'No servers match your search or filter criteria.'
                                                : 'No servers have been registered yet.'}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
                                    {filteredServers.map((server) => (
                                        <ServerGridCard key={server.id} server={server} onClick={openDetail} />
                                    ))}
                                </div>
                            )
                        ) : (
                            <ServerListTable
                                servers={filteredServers}
                                searchQuery={searchQuery}
                                onClick={openDetail}
                            />
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Server Detail Sheet */}
            <ServerDetailSheet server={selectedServer} onClose={closeDetail} />

            {/* Add Server Dialog */}
            <AddServerDialog
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                sshKeys={sshKeys}
                servers={servers}
            />
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
