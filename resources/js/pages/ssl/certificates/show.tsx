import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import Heading from '@/components/heading';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from '@/components/ui/card';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import {
    index,
    downloadFile,
    destroy,
} from '@/actions/App/Http/Controllers/Ssl/SslCertificateController';
import {
    Download,
    Trash2,
    ArrowLeft,
    Key,
    FileCheck,
    FileCode,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import type { Certificate } from '@/types';

export default function CertificateShow({
    certificate,
}: {
    certificate: Certificate;
}) {
    const { props } = usePage<any>();
    const currentTeam = props.currentTeam?.slug as string;

    const handleDelete = () => {
        router.delete(destroy.url({ current_team: currentTeam, certificate: certificate.uuid }));
    };

    const handleDownload = (type: 'cert' | 'key' | 'csr') => {
        // We use window.location.href to trigger the browser's download dialog
        // since the endpoint returns a file attachment response.
        window.location.href = downloadFile.url({
            current_team: currentTeam,
            certificate: certificate.uuid,
            type: type,
        });
    };

    return (
        <>
            <Head title={`Certificate: ${certificate.common_name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href={index.url({ current_team: currentTeam })}>
                                <Button variant="outline" size="icon">
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            </Link>
                            <Heading
                                title={certificate.common_name}
                                description="Certificate details and download options"
                            />
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        Are you sure?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will
                                        permanently delete the certificate and
                                        remove its data from the system.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>
                                        Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleDelete}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        Delete Certificate
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Subject Information</CardTitle>
                                <CardDescription>
                                    Details embedded in the certificate
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">
                                        Common Name (CN)
                                    </div>
                                    <div className="text-base font-semibold">
                                        {certificate.common_name}
                                    </div>
                                </div>
                                {certificate.san && (
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">
                                            Subject Alternative Names (SAN)
                                        </div>
                                        <div className="text-sm">
                                            {certificate.san}
                                        </div>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">
                                            Organization (O)
                                        </div>
                                        <div className="text-sm">
                                            {certificate.organization || '-'}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">
                                            Country (C)
                                        </div>
                                        <div className="text-sm uppercase">
                                            {certificate.country || '-'}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">
                                            State (ST)
                                        </div>
                                        <div className="text-sm">
                                            {certificate.state || '-'}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">
                                            Locality (L)
                                        </div>
                                        <div className="text-sm">
                                            {certificate.locality || '-'}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Cryptographic Details</CardTitle>
                                <CardDescription>
                                    Technical specifications
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">
                                        Algorithm
                                    </div>
                                    <Badge
                                        variant="secondary"
                                        className="mt-1 uppercase"
                                    >
                                        {certificate.key_algorithm}
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {certificate.key_algorithm === 'rsa' ? (
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground">
                                                Key Size
                                            </div>
                                            <div className="text-sm">
                                                {certificate.key_bits} bits
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground">
                                                Curve Name
                                            </div>
                                            <div className="text-sm">
                                                {certificate.curve_name}
                                            </div>
                                        </div>
                                    )}
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">
                                            Serial Number
                                        </div>
                                        <div className="font-mono text-sm break-all">
                                            {certificate.serial_number}
                                        </div>
                                    </div>
                                </div>
                                <Separator />
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">
                                            Valid From
                                        </div>
                                        <div className="text-sm">
                                            {new Date(
                                                certificate.valid_from,
                                            ).toLocaleString()}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">
                                            Valid Until
                                        </div>
                                        <div className="text-sm">
                                            {new Date(
                                                certificate.valid_to,
                                            ).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle>Downloads</CardTitle>
                                <CardDescription>
                                    Download your cryptographic materials
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 sm:grid-cols-3">
                                <div className="flex flex-col items-center space-y-3 rounded-lg border p-4 text-center">
                                    <div className="rounded-full bg-blue-100 p-3 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                        <FileCheck className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <div className="font-medium">
                                            Certificate
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Public key (.crt)
                                        </div>
                                    </div>
                                    <Button
                                        className="w-full"
                                        variant="outline"
                                        onClick={() => handleDownload('cert')}
                                    >
                                        <Download className="mr-2 h-4 w-4" />{' '}
                                        Download
                                    </Button>
                                </div>

                                <div className="flex flex-col items-center space-y-3 rounded-lg border p-4 text-center">
                                    <div className="rounded-full bg-red-100 p-3 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                                        <Key className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <div className="font-medium">
                                            Private Key
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Secret key (.key)
                                        </div>
                                    </div>
                                    <Button
                                        className="w-full"
                                        variant="outline"
                                        onClick={() => handleDownload('key')}
                                    >
                                        <Download className="mr-2 h-4 w-4" />{' '}
                                        Download
                                    </Button>
                                </div>

                                <div className="flex flex-col items-center space-y-3 rounded-lg border p-4 text-center">
                                    <div className="rounded-full bg-emerald-100 p-3 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                                        <FileCode className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <div className="font-medium">CSR</div>
                                        <div className="text-xs text-muted-foreground">
                                            Signing request (.csr)
                                        </div>
                                    </div>
                                    <Button
                                        className="w-full"
                                        variant="outline"
                                        onClick={() => handleDownload('csr')}
                                    >
                                        <Download className="mr-2 h-4 w-4" />{' '}
                                        Download
                                    </Button>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-muted/30 p-4 text-sm text-muted-foreground">
                                <p>
                                    <strong>Security Warning:</strong> Your
                                    Private Key is not stored unencrypted by the
                                    system. Download and keep it safe. Do not
                                    share your private key with anyone.
                                </p>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

const ShowLayout = ({ children }: { children: React.ReactNode }) => {
    const { props } = usePage<any>();
    const currentTeam = props.currentTeam?.slug;

    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: 'My Certificates',
                    href: index.url({ current_team: currentTeam }),
                },
                {
                    title: 'Certificate Details',
                    href: '#',
                },
            ]}
        >
            {children}
        </AppLayout>
    );
};

CertificateShow.layout = (page: React.ReactNode) => <ShowLayout>{page}</ShowLayout>;
