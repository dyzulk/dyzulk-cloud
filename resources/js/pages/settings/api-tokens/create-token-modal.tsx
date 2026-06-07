import { Form } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/input-error';
import ApiTokenController from '@/actions/App/Http/Controllers/Settings/ApiTokenController';

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

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <Form
                    key={String(open)}
                    {...ApiTokenController.store.form()}
                    className="space-y-6"
                    onSuccess={() => setOpen(false)}
                >
                    {({ errors, processing }) => (
                        <>
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
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-3">
                                <Label>Permissions (Scopes)</Label>
                                <div className="max-h-[250px] space-y-4 overflow-y-auto rounded-md border p-4">
                                    {availableScopes.map((scope) => (
                                        <div
                                            key={scope.value}
                                            className="flex items-start space-x-3"
                                        >
                                            <Checkbox
                                                id={`scope-${scope.value}`}
                                                name="scopes[]"
                                                value={scope.value}
                                                defaultChecked={false}
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
                                    ))}
                                </div>
                                <InputError message={errors.scopes} />
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
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
