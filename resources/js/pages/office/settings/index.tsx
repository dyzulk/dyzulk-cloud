import { Head, useForm } from '@inertiajs/react';
import {
    Activity,
    CheckCircle2,
    Clock,
    Database,
    Globe,
    KeyRound,
    Mail,
    Network,
    Save,
    Send,
    Shield,
    Sliders,
} from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SettingsProps {
    settings: {
        general: {
            instance_name: string;
            instance_url: string;
            timezone: string;
            public_ipv4: string;
            public_ipv6: string;
            wildcard_domain: string;
        };
        network: {
            app_domain: string;
            office_domain: string;
            api_domain: string;
            control_network: string;
            traefik_version: string;
            docker_pool_base: string;
            docker_pool_size: string;
            letsencrypt_email: string;
            force_https: boolean;
            traefik_dashboard_enabled: boolean;
        };
        email: {
            mail_provider: string;
            smtp_host: string;
            smtp_port: string;
            smtp_encryption: string;
            smtp_username: string;
            smtp_password: string;
            mail_from_name: string;
            mail_from_address: string;
            resend_api_key: string;
        };
        backup: {
            backup_enabled: boolean;
            s3_bucket: string;
            s3_region: string;
            s3_endpoint: string;
            s3_access_key: string;
            s3_secret_key: string;
            backup_retention_days: number;
        };
        oauth: {
            github_enabled: boolean;
            github_client_id: string;
            github_client_secret: string;
        };
        jobs: {
            docker_prune_schedule: string;
            log_retention_days: number;
            queue_workers_count: number;
        };
    };
}

export default function OfficeSettingsIndex({ settings }: SettingsProps) {
    const [activeTab, setActiveTab] = useState('general');

    // General Form
    const generalForm = useForm(settings.general);
    const handleGeneralSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        generalForm.put('/settings/general', { preserveScroll: true });
    };

    // Network Form
    const networkForm = useForm(settings.network);
    const handleNetworkSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        networkForm.put('/settings/network', { preserveScroll: true });
    };

    // Email Form
    const emailForm = useForm(settings.email);
    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        emailForm.put('/settings/email', { preserveScroll: true });
    };

    // Test Email Form
    const testEmailForm = useForm({
        recipient: settings.email.mail_from_address || '',
    });
    const handleTestEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        testEmailForm.post('/settings/email/test', { preserveScroll: true });
    };

    // Backup Form
    const backupForm = useForm(settings.backup);
    const handleBackupSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        backupForm.put('/settings/backup', { preserveScroll: true });
    };

    // OAuth Form
    const oauthForm = useForm(settings.oauth);
    const handleOauthSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        oauthForm.put('/settings/oauth', { preserveScroll: true });
    };

    // Jobs Form
    const jobsForm = useForm(settings.jobs);
    const handleJobsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        jobsForm.put('/settings/jobs', { preserveScroll: true });
    };

    return (
        <>
            <Head title="Site Settings" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 font-base">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <Heading
                        title="Site Settings"
                        description="Instance-wide configuration for dyzulk-cloud, Traefik reverse proxy, SMTP, Backups, and Integrations."
                    />
                    <Badge variant="outline" className="w-fit gap-1 text-xs">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        Control Plane v0.0.1
                    </Badge>
                </div>

                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full space-y-6"
                >
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 border-2 border-border p-1 bg-muted rounded-base">
                        <TabsTrigger value="general" className="gap-2">
                            <Globe className="h-4 w-4" />
                            <span>Configuration</span>
                        </TabsTrigger>
                        <TabsTrigger value="network" className="gap-2">
                            <Network className="h-4 w-4" />
                            <span>Proxy &amp; Docker</span>
                        </TabsTrigger>
                        <TabsTrigger value="email" className="gap-2">
                            <Mail className="h-4 w-4" />
                            <span>Email / SMTP</span>
                        </TabsTrigger>
                        <TabsTrigger value="backup" className="gap-2">
                            <Database className="h-4 w-4" />
                            <span>Backup &amp; S3</span>
                        </TabsTrigger>
                        <TabsTrigger value="oauth" className="gap-2">
                            <KeyRound className="h-4 w-4" />
                            <span>OAuth</span>
                        </TabsTrigger>
                        <TabsTrigger value="jobs" className="gap-2">
                            <Clock className="h-4 w-4" />
                            <span>Scheduled Jobs</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab 1: General / Configuration */}
                    <TabsContent value="general">
                        <Card>
                            <form onSubmit={handleGeneralSubmit}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Globe className="h-5 w-5" />
                                        General Configuration
                                    </CardTitle>
                                    <CardDescription>
                                        General instance parameters for your control panel deployment.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="instance_name">Instance Name</Label>
                                            <Input
                                                id="instance_name"
                                                value={generalForm.data.instance_name}
                                                onChange={(e) =>
                                                    generalForm.setData('instance_name', e.target.value)
                                                }
                                                placeholder="dyzulk-cloud"
                                            />
                                            {generalForm.errors.instance_name && (
                                                <p className="text-xs text-destructive">
                                                    {generalForm.errors.instance_name}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="instance_url">Instance URL</Label>
                                            <Input
                                                id="instance_url"
                                                value={generalForm.data.instance_url}
                                                onChange={(e) =>
                                                    generalForm.setData('instance_url', e.target.value)
                                                }
                                                placeholder="https://cloud.dyzulk.com"
                                            />
                                            {generalForm.errors.instance_url && (
                                                <p className="text-xs text-destructive">
                                                    {generalForm.errors.instance_url}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="timezone">Timezone</Label>
                                            <Input
                                                id="timezone"
                                                value={generalForm.data.timezone}
                                                onChange={(e) =>
                                                    generalForm.setData('timezone', e.target.value)
                                                }
                                                placeholder="UTC"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="wildcard_domain">Wildcard Domain</Label>
                                            <Input
                                                id="wildcard_domain"
                                                value={generalForm.data.wildcard_domain}
                                                onChange={(e) =>
                                                    generalForm.setData('wildcard_domain', e.target.value)
                                                }
                                                placeholder="*.dyzulk.local"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="public_ipv4">Public IPv4</Label>
                                            <Input
                                                id="public_ipv4"
                                                value={generalForm.data.public_ipv4}
                                                onChange={(e) =>
                                                    generalForm.setData('public_ipv4', e.target.value)
                                                }
                                                placeholder="172.31.100.15"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="public_ipv6">Public IPv6</Label>
                                            <Input
                                                id="public_ipv6"
                                                value={generalForm.data.public_ipv6}
                                                onChange={(e) =>
                                                    generalForm.setData('public_ipv6', e.target.value)
                                                }
                                                placeholder="2001:db8::1"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-between border-t pt-4">
                                    <span className="text-xs text-muted-foreground">
                                        Changes will be saved immediately to system configuration.
                                    </span>
                                    <Button
                                        type="submit"
                                        disabled={generalForm.processing}
                                        className="gap-2"
                                    >
                                        <Save className="h-4 w-4" />
                                        Save Changes
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                    </TabsContent>

                    {/* Tab 2: Reverse Proxy & Docker Network */}
                    <TabsContent value="network">
                        <Card>
                            <form onSubmit={handleNetworkSubmit}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Network className="h-5 w-5" />
                                        Traefik Proxy &amp; Docker Network
                                    </CardTitle>
                                    <CardDescription>
                                        Networking and ingress settings corresponding to production script install.sh.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="rounded-base border p-4 bg-muted/30 space-y-4">
                                        <h4 className="font-semibold text-sm flex items-center gap-2">
                                            <Globe className="h-4 w-4 text-primary" />
                                            External Domain Mapping per Service Port
                                        </h4>
                                        <div className="grid gap-4 md:grid-cols-3">
                                            <div className="space-y-2">
                                                <Label htmlFor="app_domain">App Domain (Port 8000)</Label>
                                                <Input
                                                    id="app_domain"
                                                    value={networkForm.data.app_domain || ''}
                                                    onChange={(e) =>
                                                        networkForm.setData('app_domain', e.target.value)
                                                    }
                                                    placeholder="cloud.example.com"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="office_domain">Office Domain (Port 8001)</Label>
                                                <Input
                                                    id="office_domain"
                                                    value={networkForm.data.office_domain || ''}
                                                    onChange={(e) =>
                                                        networkForm.setData('office_domain', e.target.value)
                                                    }
                                                    placeholder="office.example.com"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="api_domain">API Domain (Port 8002)</Label>
                                                <Input
                                                    id="api_domain"
                                                    value={networkForm.data.api_domain || ''}
                                                    onChange={(e) =>
                                                        networkForm.setData('api_domain', e.target.value)
                                                    }
                                                    placeholder="api.example.com"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="control_network">Control Network Name</Label>
                                            <Input
                                                id="control_network"
                                                value={networkForm.data.control_network}
                                                onChange={(e) =>
                                                    networkForm.setData('control_network', e.target.value)
                                                }
                                                placeholder="dyzulk-cloud-control-network"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="traefik_version">Traefik Version Tag</Label>
                                            <Input
                                                id="traefik_version"
                                                value={networkForm.data.traefik_version}
                                                onChange={(e) =>
                                                    networkForm.setData('traefik_version', e.target.value)
                                                }
                                                placeholder="v3.0"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="docker_pool_base">Docker Subnet Base</Label>
                                            <Input
                                                id="docker_pool_base"
                                                value={networkForm.data.docker_pool_base}
                                                onChange={(e) =>
                                                    networkForm.setData('docker_pool_base', e.target.value)
                                                }
                                                placeholder="10.0.0.0/8"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="docker_pool_size">Subnet Size</Label>
                                            <Input
                                                id="docker_pool_size"
                                                value={networkForm.data.docker_pool_size}
                                                onChange={(e) =>
                                                    networkForm.setData('docker_pool_size', e.target.value)
                                                }
                                                placeholder="24"
                                            />
                                        </div>

                                        <div className="space-y-2 md:col-span-2">
                                            <Label htmlFor="letsencrypt_email">Let's Encrypt SSL Email</Label>
                                            <Input
                                                id="letsencrypt_email"
                                                type="email"
                                                value={networkForm.data.letsencrypt_email}
                                                onChange={(e) =>
                                                    networkForm.setData('letsencrypt_email', e.target.value)
                                                }
                                                placeholder="admin@dyzulk.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4 rounded-base border p-4 bg-muted/40">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label htmlFor="force_https" className="font-semibold">
                                                    Enforce HTTPS Redirect
                                                </Label>
                                                <p className="text-xs text-muted-foreground">
                                                    Automatically redirect HTTP traffic to SSL/TLS HTTPS ports.
                                                </p>
                                            </div>
                                            <Switch
                                                id="force_https"
                                                checked={networkForm.data.force_https}
                                                onCheckedChange={(checked) =>
                                                    networkForm.setData('force_https', checked)
                                                }
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label htmlFor="traefik_dashboard_enabled" className="font-semibold">
                                                    Enable Traefik Dashboard UI
                                                </Label>
                                                <p className="text-xs text-muted-foreground">
                                                    Expose Traefik status and routing dashboard on internal port.
                                                </p>
                                            </div>
                                            <Switch
                                                id="traefik_dashboard_enabled"
                                                checked={networkForm.data.traefik_dashboard_enabled}
                                                onCheckedChange={(checked) =>
                                                    networkForm.setData('traefik_dashboard_enabled', checked)
                                                }
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-end border-t pt-4">
                                    <Button
                                        type="submit"
                                        disabled={networkForm.processing}
                                        className="gap-2"
                                    >
                                        <Save className="h-4 w-4" />
                                        Save Network Settings
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                    </TabsContent>

                    {/* Tab 3: Transactional Email */}
                    <TabsContent value="email" className="space-y-6">
                        <Card>
                            <form onSubmit={handleEmailSubmit}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Mail className="h-5 w-5" />
                                        Transactional Email Configuration
                                    </CardTitle>
                                    <CardDescription>
                                        Configure SMTP or Resend API for system notifications, invites, and password resets.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="mail_from_name">Sender Name</Label>
                                            <Input
                                                id="mail_from_name"
                                                value={emailForm.data.mail_from_name}
                                                onChange={(e) =>
                                                    emailForm.setData('mail_from_name', e.target.value)
                                                }
                                                placeholder="dyzulk-cloud"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="mail_from_address">Sender Email Address</Label>
                                            <Input
                                                id="mail_from_address"
                                                type="email"
                                                value={emailForm.data.mail_from_address}
                                                onChange={(e) =>
                                                    emailForm.setData('mail_from_address', e.target.value)
                                                }
                                                placeholder="noreply@dyzulk.com"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="smtp_host">SMTP Host</Label>
                                            <Input
                                                id="smtp_host"
                                                value={emailForm.data.smtp_host}
                                                onChange={(e) =>
                                                    emailForm.setData('smtp_host', e.target.value)
                                                }
                                                placeholder="smtp.mailgun.org"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="smtp_port">SMTP Port</Label>
                                            <Input
                                                id="smtp_port"
                                                value={emailForm.data.smtp_port}
                                                onChange={(e) =>
                                                    emailForm.setData('smtp_port', e.target.value)
                                                }
                                                placeholder="587"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="smtp_username">SMTP Username</Label>
                                            <Input
                                                id="smtp_username"
                                                value={emailForm.data.smtp_username}
                                                onChange={(e) =>
                                                    emailForm.setData('smtp_username', e.target.value)
                                                }
                                                placeholder="postmaster@dyzulk.com"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="smtp_password">SMTP Password</Label>
                                            <Input
                                                id="smtp_password"
                                                type="password"
                                                value={emailForm.data.smtp_password}
                                                onChange={(e) =>
                                                    emailForm.setData('smtp_password', e.target.value)
                                                }
                                                placeholder="••••••••••••"
                                            />
                                        </div>

                                        <div className="space-y-2 md:col-span-2">
                                            <Label htmlFor="resend_api_key">Resend API Key (Optional)</Label>
                                            <Input
                                                id="resend_api_key"
                                                type="password"
                                                value={emailForm.data.resend_api_key}
                                                onChange={(e) =>
                                                    emailForm.setData('resend_api_key', e.target.value)
                                                }
                                                placeholder="re_123456789"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-end border-t pt-4">
                                    <Button
                                        type="submit"
                                        disabled={emailForm.processing}
                                        className="gap-2"
                                    >
                                        <Save className="h-4 w-4" />
                                        Save Email Settings
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>

                        {/* Test Email Connection Box */}
                        <Card className="border-dashed">
                            <form onSubmit={handleTestEmailSubmit}>
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Send className="h-4 w-4 text-primary" />
                                        Send Test Email
                                    </CardTitle>
                                    <CardDescription>
                                        Verify your SMTP / Resend configuration by sending a test mail.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex gap-4">
                                    <div className="flex-1 space-y-2">
                                        <Input
                                            type="email"
                                            value={testEmailForm.data.recipient}
                                            onChange={(e) =>
                                                testEmailForm.setData('recipient', e.target.value)
                                            }
                                            placeholder="Enter recipient email address..."
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        variant="secondary"
                                        disabled={testEmailForm.processing}
                                        className="gap-2"
                                    >
                                        <Send className="h-4 w-4" />
                                        Send Test
                                    </Button>
                                </CardContent>
                            </form>
                        </Card>
                    </TabsContent>

                    {/* Tab 4: Backup & S3 Storage */}
                    <TabsContent value="backup">
                        <Card>
                            <form onSubmit={handleBackupSubmit}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Database className="h-5 w-5" />
                                        Backup &amp; S3 Storage
                                    </CardTitle>
                                    <CardDescription>
                                        Automated database backups and S3 compatible storage targets.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between rounded-base border p-4 bg-muted/40 mb-4">
                                        <div>
                                            <Label htmlFor="backup_enabled" className="font-semibold">
                                                Enable Automated Backups
                                            </Label>
                                            <p className="text-xs text-muted-foreground">
                                                Schedule periodic backups of database and application states.
                                            </p>
                                        </div>
                                        <Switch
                                            id="backup_enabled"
                                            checked={backupForm.data.backup_enabled}
                                            onCheckedChange={(checked) =>
                                                backupForm.setData('backup_enabled', checked)
                                            }
                                        />
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="s3_bucket">S3 Bucket Name</Label>
                                            <Input
                                                id="s3_bucket"
                                                value={backupForm.data.s3_bucket}
                                                onChange={(e) =>
                                                    backupForm.setData('s3_bucket', e.target.value)
                                                }
                                                placeholder="my-dyzulk-backups"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="s3_region">S3 Region</Label>
                                            <Input
                                                id="s3_region"
                                                value={backupForm.data.s3_region}
                                                onChange={(e) =>
                                                    backupForm.setData('s3_region', e.target.value)
                                                }
                                                placeholder="us-east-1"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="s3_endpoint">Custom S3 Endpoint (Optional)</Label>
                                            <Input
                                                id="s3_endpoint"
                                                value={backupForm.data.s3_endpoint}
                                                onChange={(e) =>
                                                    backupForm.setData('s3_endpoint', e.target.value)
                                                }
                                                placeholder="https://s3.us-east-1.amazonaws.com"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="backup_retention_days">Retention Period (Days)</Label>
                                            <Input
                                                id="backup_retention_days"
                                                type="number"
                                                value={backupForm.data.backup_retention_days}
                                                onChange={(e) =>
                                                    backupForm.setData('backup_retention_days', parseInt(e.target.value) || 30)
                                                }
                                                placeholder="30"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="s3_access_key">Access Key ID</Label>
                                            <Input
                                                id="s3_access_key"
                                                value={backupForm.data.s3_access_key}
                                                onChange={(e) =>
                                                    backupForm.setData('s3_access_key', e.target.value)
                                                }
                                                placeholder="AKIAIOSFODNN7EXAMPLE"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="s3_secret_key">Secret Access Key</Label>
                                            <Input
                                                id="s3_secret_key"
                                                type="password"
                                                value={backupForm.data.s3_secret_key}
                                                onChange={(e) =>
                                                    backupForm.setData('s3_secret_key', e.target.value)
                                                }
                                                placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-end border-t pt-4">
                                    <Button
                                        type="submit"
                                        disabled={backupForm.processing}
                                        className="gap-2"
                                    >
                                        <Save className="h-4 w-4" />
                                        Save Backup Settings
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                    </TabsContent>

                    {/* Tab 5: OAuth Integrations */}
                    <TabsContent value="oauth">
                        <Card>
                            <form onSubmit={handleOauthSubmit}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <KeyRound className="h-5 w-5" />
                                        OAuth &amp; Git Providers
                                    </CardTitle>
                                    <CardDescription>
                                        Configure GitHub OAuth application for single sign-on and repo integration.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between rounded-base border p-4 bg-muted/40 mb-4">
                                        <div>
                                            <Label htmlFor="github_enabled" className="font-semibold">
                                                Enable GitHub Integration
                                            </Label>
                                            <p className="text-xs text-muted-foreground">
                                                Allow repository access &amp; OAuth logins via GitHub.
                                            </p>
                                        </div>
                                        <Switch
                                            id="github_enabled"
                                            checked={oauthForm.data.github_enabled}
                                            onCheckedChange={(checked) =>
                                                oauthForm.setData('github_enabled', checked)
                                            }
                                        />
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="github_client_id">GitHub Client ID</Label>
                                            <Input
                                                id="github_client_id"
                                                value={oauthForm.data.github_client_id}
                                                onChange={(e) =>
                                                    oauthForm.setData('github_client_id', e.target.value)
                                                }
                                                placeholder="Iv1.1234567890abcdef"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="github_client_secret">GitHub Client Secret</Label>
                                            <Input
                                                id="github_client_secret"
                                                type="password"
                                                value={oauthForm.data.github_client_secret}
                                                onChange={(e) =>
                                                    oauthForm.setData('github_client_secret', e.target.value)
                                                }
                                                placeholder="••••••••••••••••••••••••••••••••"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-end border-t pt-4">
                                    <Button
                                        type="submit"
                                        disabled={oauthForm.processing}
                                        className="gap-2"
                                    >
                                        <Save className="h-4 w-4" />
                                        Save OAuth Credentials
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                    </TabsContent>

                    {/* Tab 6: Scheduled Jobs & Maintenance */}
                    <TabsContent value="jobs">
                        <Card>
                            <form onSubmit={handleJobsSubmit}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Sliders className="h-5 w-5" />
                                        Scheduled Jobs &amp; Maintenance
                                    </CardTitle>
                                    <CardDescription>
                                        Configure background cleanup tasks, queue workers, and log retention.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="docker_prune_schedule">Docker Prune Schedule</Label>
                                            <Input
                                                id="docker_prune_schedule"
                                                value={jobsForm.data.docker_prune_schedule}
                                                onChange={(e) =>
                                                    jobsForm.setData('docker_prune_schedule', e.target.value)
                                                }
                                                placeholder="daily"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="log_retention_days">Log Retention (Days)</Label>
                                            <Input
                                                id="log_retention_days"
                                                type="number"
                                                value={jobsForm.data.log_retention_days}
                                                onChange={(e) =>
                                                    jobsForm.setData('log_retention_days', parseInt(e.target.value) || 14)
                                                }
                                                placeholder="14"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="queue_workers_count">Queue Workers Count</Label>
                                            <Input
                                                id="queue_workers_count"
                                                type="number"
                                                value={jobsForm.data.queue_workers_count}
                                                onChange={(e) =>
                                                    jobsForm.setData('queue_workers_count', parseInt(e.target.value) || 2)
                                                }
                                                placeholder="2"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-end border-t pt-4">
                                    <Button
                                        type="submit"
                                        disabled={jobsForm.processing}
                                        className="gap-2"
                                    >
                                        <Save className="h-4 w-4" />
                                        Save Maintenance Settings
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}

OfficeSettingsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Site Settings',
            href: '/settings',
        },
    ],
};
