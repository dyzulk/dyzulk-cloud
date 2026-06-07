import { Head, router } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import { Plus, Key, Trash2 } from 'lucide-react';
import ApiTokenController from '@/actions/App/Http/Controllers/Settings/ApiTokenController';
import Heading from '@/components/heading';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { index as apiTokens } from '@/routes/api-tokens';
import { CreateTokenModal } from './create-token-modal';

interface Token {
    id: number;
    name: string;
    abilities: string[];
    last_used_at: string | null;
    created_at: string;
}

interface Scope {
    value: string;
    label: string;
    description: string;
}

interface Props {
    tokens: Token[];
    availableScopes: Scope[];
    newToken?: string;
}

export default function ApiTokensIndex({
    tokens,
    availableScopes,
    newToken,
}: Props) {
    const revokeToken = (id: number) => {
        if (confirm('Are you sure you want to revoke this token?')) {
            router.delete(ApiTokenController.destroy.url({ id }), {
                preserveScroll: true,
            });
        }
    };

    return (
        <>
            <Head title="API Tokens" />

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="API Tokens"
                    description="Manage your personal access tokens for API integration."
                />

                {newToken && (
                    <Alert
                        variant="destructive"
                        className="border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300"
                    >
                        <Key className="h-4 w-4 !text-green-600 dark:!text-green-400" />
                        <AlertTitle>Token Created Successfully</AlertTitle>
                        <AlertDescription className="mt-2 space-y-2">
                            <p>
                                Please copy your new API token. For your
                                security, it won't be shown again.
                            </p>
                            <code className="block rounded bg-green-100 p-2 font-mono text-sm break-all dark:bg-green-950">
                                {newToken}
                            </code>
                        </AlertDescription>
                    </Alert>
                )}

                <div className="flex justify-end">
                    <CreateTokenModal availableScopes={availableScopes}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Generate New Token
                        </Button>
                    </CreateTokenModal>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Permissions</TableHead>
                                <TableHead>Last Used</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tokens.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        className="py-8 text-center text-muted-foreground"
                                    >
                                        No API tokens created yet.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                tokens.map((token) => (
                                    <TableRow key={token.id}>
                                        <TableCell className="font-medium">
                                            {token.name}
                                            <div className="mt-1 text-xs text-muted-foreground">
                                                Created{' '}
                                                {formatDistanceToNow(
                                                    new Date(token.created_at),
                                                    { addSuffix: true },
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex max-w-[250px] flex-wrap gap-1">
                                                {token.abilities.map(
                                                    (ability) => {
                                                        const scopeLabel =
                                                            availableScopes.find(
                                                                (s) =>
                                                                    s.value ===
                                                                    ability,
                                                            )?.label || ability;

                                                        return (
                                                            <Badge
                                                                key={ability}
                                                                variant="secondary"
                                                                className="text-xs"
                                                            >
                                                                {ability === '*'
                                                                    ? 'Full Access'
                                                                    : scopeLabel}
                                                            </Badge>
                                                        );
                                                    },
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {token.last_used_at
                                                ? formatDistanceToNow(
                                                      new Date(
                                                          token.last_used_at,
                                                      ),
                                                      { addSuffix: true },
                                                  )
                                                : 'Never'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                                                onClick={() =>
                                                    revokeToken(token.id)
                                                }
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Revoke
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </>
    );
}

ApiTokensIndex.layout = {
    breadcrumbs: [
        {
            title: 'API Tokens',
            href: apiTokens(),
        },
    ],
};
