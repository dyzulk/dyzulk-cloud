import { useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import Heading from '@/components/heading';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import InputError from '@/components/input-error';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    index,
    show,
    store,
} from '@/actions/App/Http/Controllers/Ssl/SslCertificateController';
import { AlertTriangle, CheckCircle2, Search } from 'lucide-react';
import type { CaStatus, Certificate, PaginatedData } from '@/types';
import { useCaFormDefaults } from '@/hooks/use-ca-form-defaults';

export default function CertificatesIndex({
    certificates,
    caStatus,
    filters,
}: {
    certificates: PaginatedData<Certificate>;
    caStatus: CaStatus;
    filters: { search?: string };
}) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { props } = usePage<any>();
    const currentTeam = props.currentTeam?.slug as string;

    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            common_name: '',
            config_mode: 'default' as 'default' | 'manual',
            organization: '',
            locality: '',
            state: '',
            country: '',
            san: '',
            algorithm: 'rsa' as 'rsa' | 'ecc',
            key_bits: '2048',
            curve_name: 'prime256v1',
        });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            index.url(),
            { search: searchQuery },
            { preserveState: true, replace: true },
        );
    };

    const submitGenerate = (e: React.FormEvent) => {
        e.preventDefault();
        post(store.url({ current_team: currentTeam }), {
            onSuccess: () => {
                reset();
                setIsDialogOpen(false);
            },
        });
    };

    const handleOpenChange = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) {
            reset();
            clearErrors();
        }
    };

    // Ensure selected algorithm and parameters are valid based on CA availability
    useCaFormDefaults(isDialogOpen, data, setData as any, caStatus);

    return (
        <>
            <Head title="My Certificates" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="space-y-6">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <Heading
                            title="SSL/TLS Certificates"
                            description="Manage and generate Leaf Certificates for your domains."
                        />

                        <Dialog
                            open={isDialogOpen}
                            onOpenChange={handleOpenChange}
                        >
                            <DialogTrigger asChild>
                                <Button disabled={!caStatus.is_ready}>
                                    Create Certificate
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
                                <DialogHeader>
                                    <DialogTitle>
                                        Generate New Certificate
                                    </DialogTitle>
                                    <DialogDescription>
                                        Request a new Leaf Certificate signed by
                                        the internal CA.
                                    </DialogDescription>
                                </DialogHeader>
                                <form
                                    onSubmit={submitGenerate}
                                    className="space-y-4 py-4"
                                >
                                    <div className="space-y-2">
                                        <Label htmlFor="common_name">
                                            Common Name (Domain)
                                        </Label>
                                        <Input
                                            id="common_name"
                                            placeholder="e.g. app.example.com"
                                            value={data.common_name}
                                            onChange={(e) =>
                                                setData(
                                                    'common_name',
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
                                        <InputError
                                            message={errors.common_name}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="san">
                                            Subject Alternative Names (SAN) -
                                            Optional
                                        </Label>
                                        <Input
                                            id="san"
                                            placeholder="e.g. api.example.com, 192.168.1.10"
                                            value={data.san}
                                            onChange={(e) =>
                                                setData('san', e.target.value)
                                            }
                                        />
                                        <div className="text-xs text-muted-foreground">
                                            Comma-separated list of domains or
                                            IPs.
                                        </div>
                                        <InputError message={errors.san} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Algorithm</Label>
                                            <Select
                                                value={data.algorithm}
                                                onValueChange={(
                                                    val: 'rsa' | 'ecc',
                                                ) => setData('algorithm', val)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem
                                                        value="rsa"
                                                        disabled={
                                                            !caStatus.intermediate_2048 &&
                                                            !caStatus.intermediate_4096
                                                        }
                                                    >
                                                        RSA
                                                    </SelectItem>
                                                    <SelectItem
                                                        value="ecc"
                                                        disabled={
                                                            !caStatus.intermediate_ecc_256 &&
                                                            !caStatus.intermediate_ecc_384
                                                        }
                                                    >
                                                        ECC (Modern)
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <InputError
                                                message={errors.algorithm}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>
                                                {data.algorithm === 'rsa'
                                                    ? 'Key Bits'
                                                    : 'Curve Name'}
                                            </Label>
                                            {data.algorithm === 'rsa' ? (
                                                <Select
                                                    value={data.key_bits}
                                                    onValueChange={(val) =>
                                                        setData('key_bits', val)
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem
                                                            value="2048"
                                                            disabled={
                                                                !caStatus.intermediate_2048
                                                            }
                                                        >
                                                            2048-bit
                                                        </SelectItem>
                                                        <SelectItem
                                                            value="4096"
                                                            disabled={
                                                                !caStatus.intermediate_4096
                                                            }
                                                        >
                                                            4096-bit
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <Select
                                                    value={data.curve_name}
                                                    onValueChange={(val) =>
                                                        setData(
                                                            'curve_name',
                                                            val,
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem
                                                            value="prime256v1"
                                                            disabled={
                                                                !caStatus.intermediate_ecc_256
                                                            }
                                                        >
                                                            prime256v1 (P-256)
                                                        </SelectItem>
                                                        <SelectItem
                                                            value="secp384r1"
                                                            disabled={
                                                                !caStatus.intermediate_ecc_384
                                                            }
                                                        >
                                                            secp384r1 (P-384)
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                            <InputError
                                                message={
                                                    data.algorithm === 'rsa'
                                                        ? errors.key_bits
                                                        : errors.curve_name
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2 pt-2">
                                        <Label>
                                            Certificate Subject Profile
                                        </Label>
                                        <RadioGroup
                                            defaultValue={data.config_mode}
                                            onValueChange={(
                                                val: 'default' | 'manual',
                                            ) => setData('config_mode', val)}
                                            className="flex flex-row space-x-4"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem
                                                    value="default"
                                                    id="cfg-default"
                                                />
                                                <Label
                                                    htmlFor="cfg-default"
                                                    className="font-normal"
                                                >
                                                    Default Organization
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem
                                                    value="manual"
                                                    id="cfg-manual"
                                                />
                                                <Label
                                                    htmlFor="cfg-manual"
                                                    className="font-normal"
                                                >
                                                    Custom Manual
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    </div>

                                    {data.config_mode === 'manual' && (
                                        <div className="space-y-4 rounded-md border bg-muted/30 p-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="organization">
                                                    Organization Name
                                                </Label>
                                                <Input
                                                    id="organization"
                                                    value={data.organization}
                                                    onChange={(e) =>
                                                        setData(
                                                            'organization',
                                                            e.target.value,
                                                        )
                                                    }
                                                    required={
                                                        data.config_mode ===
                                                        'manual'
                                                    }
                                                />
                                                <InputError
                                                    message={
                                                        errors.organization
                                                    }
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="locality">
                                                        City / Locality
                                                    </Label>
                                                    <Input
                                                        id="locality"
                                                        value={data.locality}
                                                        onChange={(e) =>
                                                            setData(
                                                                'locality',
                                                                e.target.value,
                                                            )
                                                        }
                                                        required={
                                                            data.config_mode ===
                                                            'manual'
                                                        }
                                                    />
                                                    <InputError
                                                        message={
                                                            errors.locality
                                                        }
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="state">
                                                        State / Province
                                                    </Label>
                                                    <Input
                                                        id="state"
                                                        value={data.state}
                                                        onChange={(e) =>
                                                            setData(
                                                                'state',
                                                                e.target.value,
                                                            )
                                                        }
                                                        required={
                                                            data.config_mode ===
                                                            'manual'
                                                        }
                                                    />
                                                    <InputError
                                                        message={errors.state}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="country">
                                                    Country Code (2 Letters)
                                                </Label>
                                                <Input
                                                    id="country"
                                                    maxLength={2}
                                                    placeholder="ID, US, UK..."
                                                    value={data.country}
                                                    onChange={(e) =>
                                                        setData(
                                                            'country',
                                                            e.target.value.toUpperCase(),
                                                        )
                                                    }
                                                    required={
                                                        data.config_mode ===
                                                        'manual'
                                                    }
                                                />
                                                <InputError
                                                    message={errors.country}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-end pt-4">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() =>
                                                setIsDialogOpen(false)
                                            }
                                            className="mr-2"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                        >
                                            {processing
                                                ? 'Generating...'
                                                : 'Generate Certificate'}
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {!caStatus.is_ready && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                The Internal Certificate Authority is not fully
                                initialized. You cannot generate certificates
                                yet. Please contact an administrator.
                            </AlertDescription>
                        </Alert>
                    )}

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="space-y-1">
                                <CardTitle>My Certificates</CardTitle>
                                <CardDescription>
                                    View and download your generated
                                    certificates
                                </CardDescription>
                            </div>
                            <form
                                onSubmit={handleSearch}
                                className="relative flex"
                            >
                                <Input
                                    type="text"
                                    placeholder="Search domains..."
                                    className="w-full pr-8 sm:w-64"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                />
                                <Button
                                    type="submit"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 h-9 w-9"
                                >
                                    <Search className="h-4 w-4" />
                                </Button>
                            </form>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Domain (CN)</TableHead>
                                            <TableHead>Algorithm</TableHead>
                                            <TableHead>Valid Until</TableHead>
                                            <TableHead className="text-right">
                                                Action
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {certificates.data.length === 0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={4}
                                                    className="h-24 text-center text-muted-foreground"
                                                >
                                                    No certificates found.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            certificates.data.map((cert) => (
                                                <TableRow key={cert.uuid}>
                                                    <TableCell className="font-medium">
                                                        {cert.common_name}
                                                        {cert.organization && (
                                                            <span className="block text-xs text-muted-foreground">
                                                                {
                                                                    cert.organization
                                                                }
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant="outline"
                                                            className="uppercase"
                                                        >
                                                            {cert.key_algorithm}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {new Date(
                                                            cert.valid_to,
                                                        ).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Link
                                                            href={show.url({
                                                                current_team:
                                                                    currentTeam,
                                                                certificate:
                                                                    cert.uuid,
                                                            })}
                                                        >
                                                            <Button
                                                                variant="secondary"
                                                                size="sm"
                                                            >
                                                                View Details
                                                            </Button>
                                                        </Link>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Simple Pagination */}
                            {certificates.last_page > 1 && (
                                <div className="flex items-center justify-between space-x-2 py-4">
                                    <div className="text-sm text-muted-foreground">
                                        Page {certificates.current_page} of{' '}
                                        {certificates.last_page}
                                    </div>
                                    <div className="space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={
                                                !certificates.prev_page_url
                                            }
                                            onClick={() =>
                                                certificates.prev_page_url &&
                                                router.get(
                                                    certificates.prev_page_url,
                                                    {},
                                                    { preserveState: true },
                                                )
                                            }
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={
                                                !certificates.next_page_url
                                            }
                                            onClick={() =>
                                                certificates.next_page_url &&
                                                router.get(
                                                    certificates.next_page_url,
                                                    {},
                                                    { preserveState: true },
                                                )
                                            }
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

CertificatesIndex.layout = {
    breadcrumbs: [
        {
            title: 'My Certificates',
            href: index.url(),
        },
    ],
};
