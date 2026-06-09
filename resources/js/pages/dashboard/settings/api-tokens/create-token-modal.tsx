import { useForm } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import { useState } from 'react';
import ApiTokenController from '@/actions/App/Http/Controllers/Dashboard/Settings/ApiTokenController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface Scope {
    value: string;
    label: string;
    description: string;
}

type Props = PropsWithChildren<{
    availableScopes: Scope[];
}>;

export function CreateTokenModal({ children, availableScopes }: Props) {
    const [open, setOpen] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        expires_in: 30 as number | null,
        scopes: [] as string[],
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(ApiTokenController.store.url(), {
            onSuccess: () => {
                setOpen(false);
                reset();
                clearErrors();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={(newOpen) => {
            setOpen(newOpen);
            if (!newOpen) {
                reset();
                clearErrors();
            }
        }}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={submit} className="space-y-6">
                            <DialogHeader>
                                <DialogTitle>Generate API Token</DialogTitle>
                                <DialogDescription>
                                    Create a new personal access token for API
                                    authentication.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-2">
                                <Label htmlFor="name">Token Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="e.g. CI/CD Pipeline"
                                    autoFocus
                                    required
                                    value={data.name || ''}
                                    onChange={(e) => setData('name', e.target.value)}
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="expires_in">Expiration</Label>
                                <Select
                                    value={data.expires_in === null ? 'null' : String(data.expires_in)}
                                    onValueChange={(val) =>
                                        setData('expires_in', val === 'null' ? null : parseInt(val))
                                    }
                                >
                                    <SelectTrigger id="expires_in">
                                        <SelectValue placeholder="Select expiration" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="7">7 Days</SelectItem>
                                        <SelectItem value="30">30 Days</SelectItem>
                                        <SelectItem value="60">60 Days</SelectItem>
                                        <SelectItem value="90">90 Days</SelectItem>
                                        <SelectItem value="365">1 Year</SelectItem>
                                        <SelectItem value="null">No Expiration</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.expires_in as string} />
                            </div>

                            <div className="grid gap-3">
                                <Label>Permissions (Scopes)</Label>
                                <div className="max-h-[250px] space-y-4 overflow-y-auto rounded-md border p-4">
                                    {availableScopes.map((scope) => {
                                        const isChecked = Array.isArray(data.scopes) && data.scopes.includes(scope.value);

                                        return (
                                            <div
                                                key={scope.value}
                                                className="flex items-start space-x-3"
                                            >
                                                <Checkbox
                                                    id={`scope-${scope.value}`}
                                                    name="scopes[]"
                                                    value={scope.value}
                                                    checked={isChecked}
                                                    onCheckedChange={(checked) => {
                                                        const currentScopes = Array.isArray(data.scopes) ? [...data.scopes] : [];

                                                        if (checked) {
                                                            setData('scopes', [...currentScopes, scope.value]);
                                                        } else {
                                                            setData('scopes', currentScopes.filter((s) => s !== scope.value));
                                                        }
                                                    }}
                                                />
                                                <div className="grid gap-1.5 leading-none">
                                                    <Label
                                                        htmlFor={`scope-${scope.value}`}
                                                        className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        {scope.label}
                                                    </Label>
                                                    <p className="text-sm text-muted-foreground">
                                                        {scope.description}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <InputError message={errors.scopes as string} />
                            </div>

                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button type="submit" disabled={processing}>
                                    Generate Token
                                </Button>
                            </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
