import { Key, Eye, Trash2, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import type { SshKeyInstance } from '@/types/office';

interface SshKeyTableProps {
    keys: SshKeyInstance[];
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onView: (key: SshKeyInstance) => void;
    onDelete: (key: SshKeyInstance) => void;
    deleteProcessing: boolean;
}

export function SshKeyTable({
    keys,
    searchQuery,
    onSearchChange,
    onView,
    onDelete,
    deleteProcessing,
}: SshKeyTableProps) {
    return (
        <Card className="flex flex-1 flex-col">
            <CardHeader className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <div>
                    <CardTitle>Global SSH Keys</CardTitle>
                    <CardDescription>
                        SSH private keys configured for internal cluster operations.
                    </CardDescription>
                </div>
                <div className="relative w-full max-w-sm">
                    <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, description, or fingerprint..."
                        className="pl-9 border-2 border-border"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
            </CardHeader>
            <CardContent className="flex-1 p-0">
                {keys.length === 0 ? (
                    <div className="flex min-h-[380px] items-center justify-center p-6">
                        <Empty>
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <Key />
                                </EmptyMedia>
                                <EmptyTitle>No SSH Keys Found</EmptyTitle>
                                <EmptyDescription>
                                    {searchQuery
                                        ? 'No keys match your search criteria. Try a different query.'
                                        : 'Add your first SSH Private Key to begin connecting to remote servers.'}
                                </EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    </div>
                ) : (
                    <Table>
                        <TableHeader className="bg-secondary-background">
                            <TableRow>
                                <TableHead className="font-bold border-b-2 border-border text-foreground">Name</TableHead>
                                <TableHead className="font-bold border-b-2 border-border text-foreground">Type</TableHead>
                                <TableHead className="font-bold border-b-2 border-border text-foreground">Fingerprint</TableHead>
                                <TableHead className="font-bold border-b-2 border-border text-foreground">Date Created</TableHead>
                                <TableHead className="font-bold border-b-2 border-border text-right text-foreground">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {keys.map((key) => (
                                <TableRow key={key.id} className="hover:bg-muted/50">
                                    <TableCell className="font-bold">
                                        <div>
                                            <span className="block text-sm">{key.name}</span>
                                            {key.description && (
                                                <span className="text-xs font-normal text-muted-foreground block max-w-xs truncate">
                                                    {key.description}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className="uppercase border-2 border-border font-bold shadow-sm"
                                        >
                                            {key.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs max-w-xs truncate" title={key.fingerprint}>
                                        {key.fingerprint}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-xs">
                                        {new Date(key.created_at).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                        })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 gap-1.5 border-2 border-border shadow-sm"
                                                onClick={() => onView(key)}
                                            >
                                                <Eye className="h-3.5 w-3.5" />
                                                View Public Key
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 gap-1.5 border-2 border-red-500 text-red-500 hover:bg-red-500/10 shadow-sm"
                                                onClick={() => onDelete(key)}
                                                disabled={deleteProcessing}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                                Delete
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
