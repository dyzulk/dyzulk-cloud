import type React from 'react';
import { useState } from 'react';
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
import { router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { KeyRound, Sparkles, Copy, Check } from 'lucide-react';
import { useClipboard } from '@/hooks/use-clipboard';
import { index as sshKeysIndex } from '@/actions/App/Http/Controllers/Office/SshKeyController';
import { getRelativeUrl } from '@/lib/utils';

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
        setData: (key: any, value: any) => void;
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
    const [algorithm, setAlgorithm] = useState<'ed25519' | 'rsa'>('ed25519');
    const [generatedPublicKey, setGeneratedPublicKey] = useState<string | null>(null);
    const [copiedText, copy] = useClipboard();
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = () => {
        setIsGenerating(true);
        router.get(
            getRelativeUrl(sshKeysIndex.url()),
            { generate_type: algorithm },
            {
                preserveState: true,
                preserveScroll: true,
                only: ['generatedKey'],
                onStart: () => setIsGenerating(true),
                onFinish: () => setIsGenerating(false),
                onSuccess: (page) => {
                    const key = page.props.generatedKey as any;
                    if (key) {
                        form.setData('private_key', key.private_key);
                        setGeneratedPublicKey(key.public_key);
                        toast.success('SSH Key pair successfully generated! Review the keys below before saving.');
                    } else {
                        toast.error('Failed to generate SSH Key.');
                    }
                },
                onError: () => {
                    toast.error('Failed to generate SSH Key.');
                }
            }
        );
    };

    const handleClose = () => {
        onOpenChange(false);
        setGeneratedPublicKey(null);
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (!val) {
                handleClose();
            } else {
                onOpenChange(true);
            }
        }}>
            <DialogContent className="max-w-xl border-2 border-border shadow-shadow font-base">
                <DialogHeader>
                    <DialogTitle>Add SSH Key</DialogTitle>
                    <DialogDescription>
                        Configure a global private key to connect to your servers. Paste an existing private key or use the generator helper below.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={onSubmit} className="space-y-4 pt-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Key Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g. My Server Key"
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
                    </div>

                    {/* Generator Section */}
                    <div className="p-4 rounded-base border-2 border-dashed border-border bg-secondary-background/30 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-main" />
                                <span className="font-heading text-sm">Key Generator Helper</span>
                            </div>
                            <span className="text-xs text-muted-foreground">Optional helper</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setAlgorithm('ed25519')}
                                className={`flex flex-col items-start p-2.5 rounded-base border-2 text-left transition-all ${
                                    algorithm === 'ed25519'
                                        ? 'border-border bg-main text-main-foreground shadow-sm'
                                        : 'border-border bg-background hover:bg-muted/50'
                                }`}
                            >
                                <span className="font-heading text-xs">ED25519 (Recommended)</span>
                                <span className="text-[10px] opacity-80 mt-0.5">Modern & extremely secure</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setAlgorithm('rsa')}
                                className={`flex flex-col items-start p-2.5 rounded-base border-2 text-left transition-all ${
                                    algorithm === 'rsa'
                                        ? 'border-border bg-main text-main-foreground shadow-sm'
                                        : 'border-border bg-background hover:bg-muted/50'
                                }`}
                            >
                                <span className="font-heading text-xs">RSA (4096-bit)</span>
                                <span className="text-[10px] opacity-80 mt-0.5">Highly compatible legacy standard</span>
                            </button>
                        </div>

                        <Button
                            type="button"
                            onClick={handleGenerate}
                            className="w-full gap-2 border-2 border-border shadow-sm text-xs h-9 bg-background text-foreground hover:bg-muted"
                            disabled={isGenerating}
                        >
                            <KeyRound className="h-3.5 w-3.5" />
                            {isGenerating ? 'Generating...' : `Generate ${algorithm.toUpperCase()} Key Pair`}
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="private_key">Private Key Content</Label>
                        <Textarea
                            id="private_key"
                            placeholder="-----BEGIN OPENSSH PRIVATE KEY-----&#10;...&#10;-----END OPENSSH PRIVATE KEY-----"
                            className="min-h-[140px] font-mono text-xs border-2 border-border bg-background"
                            value={form.data.private_key}
                            onChange={(e) => form.setData('private_key', e.target.value)}
                            required
                        />
                        {form.errors.private_key && (
                            <p className="text-xs text-red-500">{form.errors.private_key}</p>
                        )}
                    </div>

                    {/* Temporary display of public key for copying on generate */}
                    {generatedPublicKey && (
                        <div className="space-y-2 p-3 bg-green-500/10 text-green-700 dark:text-green-500 rounded-base border-2 border-green-500/20 text-xs">
                            <div className="flex items-center justify-between font-heading mb-1.5">
                                <span>Copy Public Key for target servers:</span>
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="outline"
                                    className="h-6 w-6 border border-green-500/30 bg-background text-foreground"
                                    onClick={() => {
                                        copy(generatedPublicKey).then((success) => {
                                            if (success) {
                                                toast.success('Public Key copied to clipboard!');
                                            }
                                        });
                                    }}
                                >
                                    {copiedText ? (
                                        <Check className="h-3 w-3 text-green-500" />
                                    ) : (
                                        <Copy className="h-3 w-3" />
                                    )}
                                </Button>
                            </div>
                            <Textarea
                                readOnly
                                className="min-h-[60px] font-mono text-[10px] border border-green-500/20 bg-background/50 focus-visible:ring-0 text-foreground"
                                value={generatedPublicKey}
                            />
                        </div>
                    )}

                    <DialogFooter className="pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="border-2 border-border shadow-sm"
                            onClick={handleClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="border-2 border-border shadow-shadow"
                            disabled={form.processing}
                        >
                            {form.processing ? 'Saving...' : 'Save SSH Key'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
