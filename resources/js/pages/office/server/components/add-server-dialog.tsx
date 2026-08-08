import { useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select';
import {
    Combobox,
    ComboboxInput,
    ComboboxContent,
    ComboboxList,
    ComboboxItem,
    ComboboxEmpty,
} from '@/components/ui/combobox';
import { store as storeServer } from '@/actions/App/Http/Controllers/Office/ServerController';
import { getRelativeUrl } from '@/lib/utils';
import type { SshKeyInstance } from '@/types/office';
import type { ServerInstance } from '@/types/server';

interface AddServerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sshKeys: SshKeyInstance[];
    servers: ServerInstance[];
}

export function AddServerDialog({ open, onOpenChange, sshKeys, servers }: AddServerDialogProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        description: '',
        host: '',
        port: 22,
        username: 'root',
        type: 'deploy' as any,
        ssh_key_id: '',
        swarm_manager_server_id: '',
    });

    const [sshKeySearch, setSshKeySearch] = useState('');
    const [swarmManagerSearch, setSwarmManagerSearch] = useState('');

    // Filter potential swarm managers (only nodes that are already managers/independent)
    const swarmManagers = servers.filter(
        (s) => s.type === 'node' && s.swarm_manager_server_id === null
    );

    // Sync input values when dialog opens or selection changes
    useEffect(() => {
        if (open) {
            const selectedKey = sshKeys.find((k) => String(k.id) === data.ssh_key_id);
            setSshKeySearch(selectedKey ? `${selectedKey.name} (${selectedKey.type})` : '');

            const selectedMgr = swarmManagers.find(
                (m) => String(m.id) === data.swarm_manager_server_id
            );
            setSwarmManagerSearch(
                selectedMgr ? `${selectedMgr.name} (${selectedMgr.host})` : ''
            );
        }
    }, [open, data.ssh_key_id, data.swarm_manager_server_id, sshKeys, servers]);

    // Reset form when dialog closes/opens
    useEffect(() => {
        if (!open) {
            reset();
            setSshKeySearch('');
            setSwarmManagerSearch('');
        } else if (sshKeys.length > 0 && !data.ssh_key_id) {
            setData('ssh_key_id', String(sshKeys[0].id));
        }
    }, [open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(getRelativeUrl(storeServer.url()), {
            onSuccess: () => {
                onOpenChange(false);
                reset();
            },
        });
    };

    // Filtered lists
    const filteredKeys = sshKeys.filter((key) => {
        const searchLower = sshKeySearch.toLowerCase();
        const selectedKey = sshKeys.find((k) => String(k.id) === data.ssh_key_id);
        const selectedLabel = selectedKey ? `${selectedKey.name} (${selectedKey.type})` : '';
        
        if (sshKeySearch === selectedLabel) {
            return true;
        }

        return (
            key.name.toLowerCase().includes(searchLower) ||
            key.type.toLowerCase().includes(searchLower)
        );
    });

    const filteredManagers = swarmManagers.filter((mgr) => {
        const searchLower = swarmManagerSearch.toLowerCase();
        const selectedMgr = swarmManagers.find(
            (m) => String(m.id) === data.swarm_manager_server_id
        );
        const selectedLabel = selectedMgr ? `${selectedMgr.name} (${selectedMgr.host})` : '';

        if (swarmManagerSearch === selectedLabel) {
            return true;
        }

        return (
            mgr.name.toLowerCase().includes(searchLower) ||
            mgr.host.toLowerCase().includes(searchLower)
        );
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="sm:max-w-[500px]"
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle className="font-heading">Add New Server</DialogTitle>
                    <DialogDescription>
                        Register a new server instance. It will automatically run verification and setup.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    {/* Name */}
                    <div className="grid gap-2">
                        <Label htmlFor="name">Server Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g. Production Swarm Manager"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                    </div>

                    {/* Description */}
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Optional server description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                        />
                        {errors.description && (
                            <p className="text-xs text-destructive">{errors.description}</p>
                        )}
                    </div>

                    {/* Connection Info */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2 grid gap-2">
                            <Label htmlFor="host">Host / IP</Label>
                            <Input
                                id="host"
                                placeholder="192.168.1.50 or domain.com"
                                value={data.host}
                                onChange={(e) => setData('host', e.target.value)}
                                required
                            />
                            {errors.host && (
                                <p className="text-xs text-destructive">{errors.host}</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="port">Port</Label>
                            <Input
                                id="port"
                                type="number"
                                value={data.port}
                                onChange={(e) => setData('port', parseInt(e.target.value) || 22)}
                                required
                            />
                            {errors.port && (
                                <p className="text-xs text-destructive">{errors.port}</p>
                            )}
                        </div>
                    </div>

                    {/* SSH Username & Type */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                value={data.username}
                                onChange={(e) => setData('username', e.target.value)}
                                required
                            />
                            {errors.username && (
                                <p className="text-xs text-destructive">{errors.username}</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="type">Server Type</Label>
                            <Select
                                value={data.type}
                                onValueChange={(val) => setData('type', val as any)}
                            >
                                <SelectTrigger id="type" className="w-full bg-secondary-background text-foreground border-2 border-border shadow-shadow">
                                    <SelectValue placeholder="Select type..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="deploy">Deploy Host</SelectItem>
                                    <SelectItem value="node">Swarm Cluster Node</SelectItem>
                                    <SelectItem value="build">Build Runner</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.type && (
                                <p className="text-xs text-destructive">{errors.type}</p>
                            )}
                        </div>
                    </div>

                    {/* SSH Key Selector */}
                    <div className="grid gap-2">
                        <Label htmlFor="ssh_key_id">SSH Credential / Key</Label>
                        <Combobox
                            value={data.ssh_key_id}
                            onValueChange={(val) => setData('ssh_key_id', val || '')}
                            inputValue={sshKeySearch}
                            onInputValueChange={setSshKeySearch}
                        >
                            <ComboboxInput placeholder="Search SSH Key..." className="w-full" />
                            <ComboboxContent>
                                <ComboboxList className="p-1.5 max-h-60 overflow-y-auto">
                                    {filteredKeys.map((key) => (
                                        <ComboboxItem key={key.id} value={String(key.id)} className="py-2.5">
                                            {key.name} ({key.type})
                                        </ComboboxItem>
                                    ))}
                                    {filteredKeys.length === 0 && (
                                        <div className="py-3 text-center text-sm text-muted-foreground">
                                            No SSH Key found
                                        </div>
                                    )}
                                </ComboboxList>
                            </ComboboxContent>
                        </Combobox>
                        {errors.ssh_key_id && (
                            <p className="text-xs text-destructive">{errors.ssh_key_id}</p>
                        )}
                    </div>

                    {/* Swarm Manager Select (Conditional) */}
                    {data.type === 'node' && swarmManagers.length > 0 && (
                        <div className="grid gap-2">
                            <Label htmlFor="swarm_manager_server_id">Swarm Manager (Parent)</Label>
                            <Combobox
                                value={data.swarm_manager_server_id}
                                onValueChange={(val) => setData('swarm_manager_server_id', val || '')}
                                inputValue={swarmManagerSearch}
                                onInputValueChange={setSwarmManagerSearch}
                            >
                                <ComboboxInput placeholder="Search Swarm Manager..." className="w-full" />
                                <ComboboxContent>
                                    <ComboboxList className="p-1.5 max-h-60 overflow-y-auto">
                                        <ComboboxItem value="" className="py-2.5">
                                            Initialize as Swarm Manager (Leader)
                                        </ComboboxItem>
                                        {filteredManagers.map((mgr) => (
                                            <ComboboxItem key={mgr.id} value={String(mgr.id)} className="py-2.5">
                                                {mgr.name} ({mgr.host})
                                            </ComboboxItem>
                                        ))}
                                        {filteredManagers.length === 0 && (
                                            <div className="py-3 text-center text-sm text-muted-foreground">
                                                No Swarm Manager found
                                            </div>
                                        )}
                                    </ComboboxList>
                                </ComboboxContent>
                            </Combobox>
                            {errors.swarm_manager_server_id && (
                                <p className="text-xs text-destructive">
                                    {errors.swarm_manager_server_id}
                                </p>
                            )}
                        </div>
                    )}

                    <DialogFooter className="pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Registering...' : 'Register Server'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
