import { Head, useForm } from '@inertiajs/react';
import {
    CheckCircle2,
    Key,
    Loader2,
    MoreVertical,
    ShieldCheck,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
    index,
    renew,
    renewAll,
    setupCa,
} from '@/actions/App/Http/Controllers/Office/SslCaController';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { getRelativeUrl } from '@/lib/utils';
import type { CaCertificate, CaStatus } from '@/types';

type CaTypeKey =
    | 'root'
    | 'root_ecc'
    | 'intermediate_2048'
    | 'intermediate_4096'
    | 'intermediate_ecc_256'
    | 'intermediate_ecc_384';

const caTypeLabels: Record<CaTypeKey, string> = {
    root: 'Root RSA',
    root_ecc: 'Root ECC',
    intermediate_2048: 'Intermediate RSA 2048',
    intermediate_4096: 'Intermediate RSA 4096',
    intermediate_ecc_256: 'Intermediate ECC 256',
    intermediate_ecc_384: 'Intermediate ECC 384',
};

const StatusItem = ({
    type,
    isReady,
    onClick,
}: {
    type: CaTypeKey;
    isReady: boolean;
    onClick: (type: CaTypeKey) => void;
}) => (
    <div
        onClick={() => onClick(type)}
        className="flex cursor-pointer items-center justify-between rounded-md border p-3 transition-colors hover:bg-muted/50"
    >
        <span className="text-sm font-medium">{caTypeLabels[type]}</span>
        {isReady ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
        ) : (
            <XCircle className="h-5 w-5 text-red-500" />
        )}
    </div>
);

export default function CaIndex({
    caCertificates,
    caStatus,
}: {
    caCertificates: CaCertificate[];
    caStatus: CaStatus;
}) {
    const [selectedCaType, setSelectedCaType] = useState<CaTypeKey | null>(
        null,
    );
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Setup CA Form
    const setupForm = useForm({
        ca_type: '',
    });

    // Renew All Form
    const renewAllForm = useForm({});

    // Renew Single Form
    const renewSingleForm = useForm({});



    const handleStatusClick = (caType: CaTypeKey) => {
        setSelectedCaType(caType);
        setupForm.setData('ca_type', caType);
        setIsDialogOpen(true);
    };

    const isMissingRootForIntermediate = (type: CaTypeKey) => {
        if (type.startsWith('intermediate_ecc_') && !caStatus.root_ecc) {
            return true;
        }

        if (
            type.startsWith('intermediate_') &&
            !type.includes('_ecc_') &&
            !caStatus.root
        ) {
            return true;
        }

        return false;
    };

    const handleGenerate = (e: React.FormEvent) => {
        e.preventDefault();
        setupForm.post(getRelativeUrl(setupCa.url()), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(
                    `CA ${caTypeLabels[setupForm.data.ca_type as CaTypeKey]} generated successfully.`,
                );
                setIsDialogOpen(false);
            },
            onError: (errors) => {
                toast.error(errors.ca_type || 'Failed to generate CA.');
            },
        });
    };

    const handleRenewAll = () => {
        renewAllForm.post(getRelativeUrl(renewAll.url()), {
            preserveScroll: true,
            onSuccess: () =>
                toast.success('All CA certificates renewed successfully.'),
        });
    };

    const handleRenewSingle = (uuid: string, name: string) => {
        renewSingleForm.post(getRelativeUrl(renew.url({ certificate: uuid })), {
            preserveScroll: true,
            onSuccess: () => toast.success(`CA ${name} renewed successfully.`),
        });
    };



    return (
        <>
            <Head title="CA Management" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <Heading
                            title="Certificate Authority Management"
                            description="Manage Root and Intermediate certificates for your internal CA."
                        />
                        <div className="flex gap-2">
                            <Button
                                onClick={handleRenewAll}
                                variant="outline"
                                disabled={
                                    !caStatus.is_ready ||
                                    renewAllForm.processing
                                }
                            >
                                {renewAllForm.processing ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : null}
                                Renew All Active
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">
                                    CA Status
                                </CardTitle>
                                <CardDescription>
                                    Click on any item to generate or view its
                                    details.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <StatusItem
                                    type="root"
                                    isReady={caStatus.root}
                                    onClick={handleStatusClick}
                                />
                                <StatusItem
                                    type="root_ecc"
                                    isReady={caStatus.root_ecc}
                                    onClick={handleStatusClick}
                                />
                                <StatusItem
                                    type="intermediate_2048"
                                    isReady={caStatus.intermediate_2048}
                                    onClick={handleStatusClick}
                                />
                                <StatusItem
                                    type="intermediate_4096"
                                    isReady={caStatus.intermediate_4096}
                                    onClick={handleStatusClick}
                                />
                                <StatusItem
                                    type="intermediate_ecc_256"
                                    isReady={caStatus.intermediate_ecc_256}
                                    onClick={handleStatusClick}
                                />
                                <StatusItem
                                    type="intermediate_ecc_384"
                                    isReady={caStatus.intermediate_ecc_384}
                                    onClick={handleStatusClick}
                                />
                            </CardContent>
                        </Card>

                        <Card className="md:col-span-1 lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Certificates List</CardTitle>
                                <CardDescription>
                                    All generated CA certificates
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Type</TableHead>
                                                <TableHead>
                                                    Common Name
                                                </TableHead>
                                                <TableHead>Valid To</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">
                                                    Action
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {caCertificates.length === 0 ? (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={5}
                                                        className="h-24 text-center text-muted-foreground"
                                                    >
                                                        No CA certificates
                                                        found. Click items in
                                                        the Status card to
                                                        generate them.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                caCertificates.map((cert) => (
                                                    <TableRow key={cert.uuid}>
                                                        <TableCell className="font-medium">
                                                            {cert.ca_type}
                                                        </TableCell>
                                                        <TableCell>
                                                            {cert.common_name}
                                                        </TableCell>
                                                        <TableCell>
                                                            {new Date(
                                                                cert.valid_to,
                                                            ).toLocaleDateString()}
                                                        </TableCell>
                                                        <TableCell>
                                                            {cert.is_latest ? (
                                                                <Badge
                                                                    variant="default"
                                                                    className="bg-green-500 hover:bg-green-600"
                                                                >
                                                                    Active
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="secondary">
                                                                    Archived
                                                                </Badge>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {cert.is_latest && (
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger
                                                                        asChild
                                                                    >
                                                                        <Button
                                                                            variant="ghost"
                                                                            className="h-8 w-8 p-0"
                                                                            disabled={
                                                                                renewSingleForm.processing
                                                                            }
                                                                        >
                                                                            <span className="sr-only">
                                                                                Open
                                                                                menu
                                                                            </span>
                                                                            <MoreVertical className="h-4 w-4" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end">
                                                                        <DropdownMenuItem
                                                                            onClick={() =>
                                                                                handleRenewSingle(
                                                                                    cert.uuid,
                                                                                    cert.common_name,
                                                                                )
                                                                            }
                                                                        >
                                                                            Renew
                                                                            Certificate
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem
                                                                            onClick={() =>
                                                                                handleStatusClick(
                                                                                    cert.ca_type as CaTypeKey,
                                                                                )
                                                                            }
                                                                        >
                                                                            View
                                                                            Details
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedCaType
                                ? caTypeLabels[selectedCaType]
                                : 'Certificate Details'}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedCaType && caStatus[selectedCaType]
                                ? 'This certificate is currently active and securing the hierarchy.'
                                : 'Initialize this certificate to enable it in the hierarchy.'}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedCaType && (
                        <div className="py-4">
                            {caStatus[selectedCaType] ? (
                                <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border bg-green-50/50 py-4 dark:bg-green-950/20">
                                    <ShieldCheck className="h-16 w-16 text-green-500" />
                                    <div className="text-center">
                                        <h4 className="font-semibold text-green-700 dark:text-green-400">
                                            Ready & Active
                                        </h4>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            This CA has been successfully
                                            generated.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <form
                                    id="generate-ca-form"
                                    onSubmit={handleGenerate}
                                    className="space-y-4"
                                >
                                    <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border bg-muted/30 py-6">
                                        <Key className="h-12 w-12 text-muted-foreground opacity-50" />
                                        <div className="px-4 text-center">
                                            {isMissingRootForIntermediate(
                                                selectedCaType,
                                            ) ? (
                                                <p className="text-sm text-red-500">
                                                    You must generate the parent
                                                    Root CA before generating
                                                    this Intermediate CA.
                                                </p>
                                            ) : (
                                                <p className="text-sm text-muted-foreground">
                                                    Click generate to create the
                                                    cryptographic keys and
                                                    certificate for this CA.
                                                    This process may take a
                                                    moment.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDialogOpen(false)}
                        >
                            Close
                        </Button>
                        {selectedCaType && !caStatus[selectedCaType] && (
                            <Button
                                type="submit"
                                form="generate-ca-form"
                                disabled={
                                    isMissingRootForIntermediate(
                                        selectedCaType,
                                    ) || setupForm.processing
                                }
                            >
                                {setupForm.processing && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Generate CA
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

CaIndex.layout = {
    breadcrumbs: [
        {
            title: 'CA Management',
            href: getRelativeUrl(index.url()),
        },
    ],
};
