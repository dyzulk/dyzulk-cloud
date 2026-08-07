import type React from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CreateSshKeyDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (e: React.FormEvent) => void;
    form: {
        data: {
            name: string;
            description: string;
            private_key: string;
        };
        setData: (
            key: 'name' | 'description' | 'private_key',
            value: string
        ) => void;
        errors: {
            name?: string;
            description?: string;
            private_key?: string;
        };
        processing: boolean;
    };
}

export function CreateSshKeyDialog({
    open,
    onOpenChange,
    onSubmit,
    form,
}: CreateSshKeyDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md border-2 border-border shadow-shadow font-base">
                <DialogHeader>
                    <DialogTitle>Add SSH Private Key</DialogTitle>
                    <DialogDescription>
                        Configure a new private key for secure authentication to remote hosts.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={onSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Key Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g. Production Web Key"
                            className="border-2 border-border"
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                            required
                        />
                        {form.errors.name && (
                            <p className="text-xs text-red-500">{form.errors.name}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                            id="description"
                            placeholder="Describe where this key is used..."
                            className="border-2 border-border"
                            value={form.data.description}
                            onChange={(e) => form.setData('description', e.target.value)}
                        />
                        {form.errors.description && (
                            <p className="text-xs text-red-500">{form.errors.description}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="private_key">Private Key Content</Label>
                        <Textarea
                            id="private_key"
                            placeholder="-----BEGIN OPENSSH PRIVATE KEY-----&#10;...&#10;-----END OPENSSH PRIVATE KEY-----"
                            className="min-h-[160px] font-mono text-xs border-2 border-border"
                            value={form.data.private_key}
                            onChange={(e) => form.setData('private_key', e.target.value)}
                            required
                        />
                        {form.errors.private_key && (
                            <p className="text-xs text-red-500">{form.errors.private_key}</p>
                        )}
                    </div>

                    <DialogFooter className="pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="border-2 border-border shadow-sm"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="border-2 border-border shadow-shadow"
                            disabled={form.processing}
                        >
                            {form.processing ? 'Adding...' : 'Add Key'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
