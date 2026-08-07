import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
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
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
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

    // Reset form when dialog closes/opens
    useEffect(() => {
        if (!open) {
            reset();
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

    // Filter potential swarm managers (only nodes that are already managers/independent)
    const swarmManagers = servers.filter(
        (s) => s.type === 'node' && s.swarm_manager_server_id === null
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
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
                            <NativeSelect
                                id="type"
                                className="w-full"
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value as any)}
                            >
                                <NativeSelectOption value="deploy">Deploy Host</NativeSelectOption>
                                <NativeSelectOption value="node">Swarm Cluster Node</NativeSelectOption>
                                <NativeSelectOption value="build">Build Runner</NativeSelectOption>
                                <NativeSelectOption value="local">Local Engine</NativeSelectOption>
                            </NativeSelect>
                            {errors.type && (
                                <p className="text-xs text-destructive">{errors.type}</p>
                            )}
                        </div>
                    </div>

                    {/* SSH Key Selector */}
                    <div className="grid gap-2">
                        <Label htmlFor="ssh_key_id">SSH Credential / Key</Label>
                        <NativeSelect
                            id="ssh_key_id"
                            className="w-full"
                            value={data.ssh_key_id}
                            onChange={(e) => setData('ssh_key_id', e.target.value)}
                            required
                        >
                            {sshKeys.map((key) => (
                                <NativeSelectOption key={key.id} value={String(key.id)}>
                                    {key.name} ({key.type})
                                </NativeSelectOption>
                            ))}
                        </NativeSelect>
                        {errors.ssh_key_id && (
                            <p className="text-xs text-destructive">{errors.ssh_key_id}</p>
                        )}
                    </div>

                    {/* Swarm Manager Select (Conditional) */}
                    {data.type === 'node' && swarmManagers.length > 0 && (
                        <div className="grid gap-2">
                            <Label htmlFor="swarm_manager_server_id">Swarm Manager (Parent)</Label>
                            <NativeSelect
                                id="swarm_manager_server_id"
                                className="w-full"
                                value={data.swarm_manager_server_id}
                                onChange={(e) => setData('swarm_manager_server_id', e.target.value)}
                            >
                                <NativeSelectOption value="">
                                    Initialize as Swarm Manager (Leader)
                                </NativeSelectOption>
                                {swarmManagers.map((mgr) => (
                                    <NativeSelectOption key={mgr.id} value={String(mgr.id)}>
                                        {mgr.name} ({mgr.host})
                                    </NativeSelectOption>
                                ))}
                            </NativeSelect>
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
