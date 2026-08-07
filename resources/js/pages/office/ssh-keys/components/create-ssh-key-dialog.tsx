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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { KeyRound, UploadCloud, Info } from 'lucide-react';

interface CreateSshKeyDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (e: React.FormEvent) => void;
    form: {
        data: {
            name: string;
            description: string;
            private_key: string;
            creation_method: 'generate' | 'import';
            type: 'rsa' | 'ed25519';
        };
        setData: (key: any, value: any) => void;
        errors: {
            name?: string;
            description?: string;
            private_key?: string;
            type?: string;
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
            <DialogContent className="max-w-lg border-2 border-border shadow-shadow font-base">
                <DialogHeader>
                    <DialogTitle>Add SSH Key</DialogTitle>
                    <DialogDescription>
                        Configure how the system authenticates to remote servers. You can generate a new key or import an existing one.
                    </DialogDescription>
                </DialogHeader>

                <Tabs
                    value={form.data.creation_method}
                    onValueChange={(val) => form.setData('creation_method', val as 'generate' | 'import')}
                    className="w-full mt-2"
                >
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="generate" className="gap-2">
                            <KeyRound className="h-4 w-4" />
                            Generate Key Pair
                        </TabsTrigger>
                        <TabsTrigger value="import" className="gap-2">
                            <UploadCloud className="h-4 w-4" />
                            Import Private Key
                        </TabsTrigger>
                    </TabsList>

                    <form onSubmit={onSubmit} className="space-y-4">
                        {/* Common Fields */}
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

                        <TabsContent value="generate" className="space-y-4 mt-0">
                            <div className="space-y-2">
                                <Label>Key Algorithm</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => form.setData('type', 'ed25519')}
                                        className={`flex flex-col items-start p-4 rounded-base border-2 text-left transition-all ${
                                            form.data.type === 'ed25519'
                                                ? 'border-border bg-main text-main-foreground shadow-shadow'
                                                : 'border-border bg-background hover:bg-muted/50'
                                        }`}
                                    >
                                        <span className="font-heading text-sm">ED25519 (Recommended)</span>
                                        <span className="text-xs opacity-80 mt-1">
                                            Modern, fast, and extremely secure cryptographic standard.
                                        </span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => form.setData('type', 'rsa')}
                                        className={`flex flex-col items-start p-4 rounded-base border-2 text-left transition-all ${
                                            form.data.type === 'rsa'
                                                ? 'border-border bg-main text-main-foreground shadow-shadow'
                                                : 'border-border bg-background hover:bg-muted/50'
                                        }`}
                                    >
                                        <span className="font-heading text-sm">RSA (4096-bit)</span>
                                        <span className="text-xs opacity-80 mt-1">
                                            Highly compatible, classic standard with strong 4096-bit length.
                                        </span>
                                    </button>
                                </div>
                                {form.errors.type && (
                                    <p className="text-xs text-red-500">{form.errors.type}</p>
                                )}
                            </div>

                            <div className="flex gap-2.5 items-start p-3 bg-blue-500/10 text-blue-500 rounded-base border-2 border-blue-500/20 text-xs">
                                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-bold">Info:</span> The system will generate both private and public keys. The private key remains encrypted and stored in our database, and the public key will be shown for authorization.
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="import" className="space-y-4 mt-0">
                            <div className="space-y-2">
                                <Label htmlFor="private_key">Private Key Content</Label>
                                <Textarea
                                    id="private_key"
                                    placeholder="-----BEGIN OPENSSH PRIVATE KEY-----&#10;...&#10;-----END OPENSSH PRIVATE KEY-----"
                                    className="min-h-[160px] font-mono text-xs border-2 border-border"
                                    value={form.data.private_key}
                                    onChange={(e) => form.setData('private_key', e.target.value)}
                                    required={form.data.creation_method === 'import'}
                                />
                                {form.errors.private_key && (
                                    <p className="text-xs text-red-500">{form.errors.private_key}</p>
                                )}
                            </div>

                            <div className="flex gap-2.5 items-start p-3 bg-amber-500/10 text-amber-600 dark:text-amber-500 rounded-base border-2 border-amber-500/20 text-xs">
                                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-bold">Security Note:</span> Paste a valid private key that does not require a passphrase. The key will be stored securely using industry-standard encryption at rest.
                                </div>
                            </div>
                        </TabsContent>

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
                                {form.processing
                                    ? form.data.creation_method === 'generate'
                                        ? 'Generating...'
                                        : 'Adding...'
                                    : form.data.creation_method === 'generate'
                                    ? 'Generate & Save Key'
                                    : 'Import Key'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
