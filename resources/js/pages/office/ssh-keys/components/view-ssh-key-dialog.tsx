import { Check, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useClipboard } from '@/hooks/use-clipboard';
import type { SshKeyInstance } from '@/types/office';

interface ViewSshKeyDialogProps {
    keyInstance: SshKeyInstance | null;
    onClose: () => void;
}

export function ViewSshKeyDialog({ keyInstance, onClose }: ViewSshKeyDialogProps) {
    const [copiedText, copy] = useClipboard();
    const hasCopied = !!copiedText;

    const copyToClipboard = (text: string) => {
        copy(text).then((success) => {
            if (success) {
                toast.success('Public Key copied to clipboard!');
            } else {
                toast.error('Failed to copy to clipboard.');
            }
        });
    };

    return (
        <Dialog open={!!keyInstance} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-xl border-2 border-border shadow-shadow font-base">
                <DialogHeader>
                    <DialogTitle>SSH Public Key: {keyInstance?.name}</DialogTitle>
                    <DialogDescription>
                        Add this public key to the target server's `authorized_keys` file to authorize access.
                    </DialogDescription>
                </DialogHeader>

                {keyInstance && (
                    <div className="space-y-4 pt-4">
                        <div className="relative">
                            <Textarea
                                readOnly
                                className="min-h-[160px] pr-12 font-mono text-xs border-2 border-border bg-muted/30 focus-visible:ring-0"
                                value={keyInstance.public_key}
                            />
                            <Button
                                size="icon"
                                variant="outline"
                                className="absolute top-3 right-3 h-8 w-8 border-2 border-border shadow-sm bg-background"
                                onClick={() => copyToClipboard(keyInstance.public_key)}
                            >
                                {hasCopied ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                            </Button>
                        </div>

                        <div className="text-xs text-muted-foreground bg-muted p-3 rounded-base border-2 border-border">
                            <strong>Info:</strong> Kunci publik ini diekstraksi secara otomatis dari kunci privat Anda menggunakan algoritma <code>{keyInstance.type.toUpperCase()}</code>.
                        </div>

                        <DialogFooter>
                            <Button
                                onClick={onClose}
                                className="border-2 border-border shadow-shadow"
                            >
                                Close
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
