import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Check, Folder, Loader2, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { store } from '@/actions/App/Http/Controllers/Dashboard/ApplicationController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface GitConnection {
    id: number;
    provider: string;
    provider_installation_id: string;
    provider_account_id: string;
    provider_account_name: string;
    provider_account_avatar_url: string | null;
    repository_selection: string;
}

type Props = {
    gitConnections: GitConnection[];
};

const repositories = [
    { name: 'dyzulk-cloud', updated: '9 hours ago' },
    { name: 'openspeedtest-vite', updated: '18 days ago' },
    { name: 'openspeedtest-vite-react', updated: '23 days ago' },
    { name: 'speedtest', updated: '24 days ago' },
    { name: 'openspeedtest-react', updated: '24 days ago' },
    { name: 'goxstream-hls-converter', updated: 'a month ago' },
    { name: 'imgix-cli-unofficial', updated: 'a month ago' },
    { name: 'laravel-starter', updated: 'recently' },
];

const computeSizes = [
    { value: 'Flex 512 MiB', label: 'Flex 512 MiB' },
    { value: 'Standard 1 GiB', label: 'Standard 1 GiB' },
    { value: 'Standard 2 GiB', label: 'Standard 2 GiB' },
    { value: 'Performance 4 GiB', label: 'Performance 4 GiB' },
];

const regions = [
    { value: 'Asia Pacific (Singapore)', label: 'Asia Pacific (Singapore)' },
    { value: 'US East (Virginia)', label: 'US East (Virginia)' },
    { value: 'Europe (Frankfurt)', label: 'Europe (Frankfurt)' },
];

export default function CreateApplication({ gitConnections }: Props) {
    const page = usePage();
    const currentTeam = (page.props as Record<string, any>).currentTeam;
    const teamSlug = currentTeam?.slug || 'default';

    const [activeTab, setActiveTab] = useState<'import' | 'template'>('import');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRepo, setSelectedRepo] = useState<string | null>(null);

    const activeConnection = gitConnections.length > 0 ? gitConnections[0] : null;
    const accountName = activeConnection?.provider_account_name || 'dyzulk';

    const filteredRepos = repositories.filter((r) =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        display_name: '',
        git_connection_id: activeConnection?.id ?? (null as number | null),
        git_repository_id: '' as string,
        repository_name: '',
        branch: 'main',
        compute_size: 'Flex 512 MiB',
        region: 'Asia Pacific (Singapore)',
    });

    useEffect(() => {
        if (selectedRepo) {
            const repoSlug = selectedRepo.split('/').pop() || '';
            setData((prev) => ({
                ...prev,
                name: repoSlug,
                display_name: repoSlug,
                repository_name: selectedRepo,
                git_repository_id: String(Math.floor(Math.random() * 900000) + 100000),
                git_connection_id: activeConnection?.id ?? null,
            }));
        }
    }, [selectedRepo]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(store.url());
    };

    return (
        <>
            <Head title="Create Application" />

            <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
                <div className="space-y-1 text-center">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Create your first application
                    </h1>
                    <p className="text-xs text-muted-foreground">
                        Select a repository, then configure and deploy.
                    </p>
                </div>

                {/* Sub-tabs: Import a repository / Use a template */}
                <div className="flex justify-center border-b border-border/60">
                    <div className="flex space-x-6 text-sm font-medium">
                        <button
                            type="button"
                            onClick={() => setActiveTab('import')}
                            className={`pb-3 font-medium transition-colors ${
                                activeTab === 'import'
                                    ? 'border-b-2 border-primary font-semibold text-foreground'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            Import a repository
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('template')}
                            className={`pb-3 font-medium transition-colors ${
                                activeTab === 'template'
                                    ? 'border-b-2 border-primary font-semibold text-foreground'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            Use a template
                        </button>
                    </div>
                </div>

                {activeTab === 'import' ? (
                    <form onSubmit={submit} className="space-y-6">
                        {/* Repository Selection Card */}
                        <Card className="border-border/80 shadow-xs">
                            <CardHeader className="border-b border-border/40 px-6 py-4">
                                <CardTitle className="text-sm font-semibold">
                                    Select Repository
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    {activeConnection ? (
                                        <>
                                            Showing repositories from{' '}
                                            <span className="font-semibold text-foreground">
                                                {accountName}
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            Connect your GitHub account to import repositories.{' '}
                                            <Link
                                                href={`/${teamSlug}/settings`}
                                                className="text-primary underline"
                                            >
                                                Go to settings
                                            </Link>
                                        </>
                                    )}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 p-6">
                                {/* Search Repository */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search all repositories"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9 text-xs"
                                    />
                                </div>

                                {/* Repository Selector List */}
                                <div className="max-h-64 divide-y divide-border/40 overflow-y-auto rounded-lg border border-border/80">
                                    {filteredRepos.map((repo) => (
                                        <div
                                            key={repo.name}
                                            onClick={() =>
                                                setSelectedRepo(`${accountName}/${repo.name}`)
                                            }
                                            className={`flex cursor-pointer items-center justify-between p-3 transition-colors hover:bg-muted/40 ${
                                                selectedRepo === `${accountName}/${repo.name}`
                                                    ? 'bg-primary/5'
                                                    : ''
                                            }`}
                                        >
                                            <div className="flex items-center space-x-2.5">
                                                <Folder className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-xs font-semibold text-foreground">
                                                    {accountName}/{repo.name}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                                                <span>{repo.updated}</span>
                                                {selectedRepo ===
                                                    `${accountName}/${repo.name}` && (
                                                    <Check className="h-4 w-4 text-primary" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {filteredRepos.length === 0 && (
                                        <div className="p-6 text-center text-xs text-muted-foreground">
                                            No repositories match your search.
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Configuration Card - only shown when a repo is selected */}
                        {selectedRepo && (
                            <Card className="border-border/80 shadow-xs">
                                <CardHeader className="border-b border-border/40 px-6 py-4">
                                    <CardTitle className="text-sm font-semibold">
                                        Configure Application
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Set up the deployment details for{' '}
                                        <span className="font-semibold text-foreground">
                                            {selectedRepo}
                                        </span>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-5 p-6">
                                    {/* Application Name */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="name" className="text-xs font-medium">
                                            Application Name
                                        </Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            placeholder="my-laravel-app"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="text-xs"
                                        />
                                        <p className="text-[10px] text-muted-foreground">
                                            Only lowercase letters, numbers, and dashes are
                                            allowed.
                                        </p>
                                        <InputError message={errors.name} />
                                    </div>

                                    {/* Display Name */}
                                    <div className="grid gap-2">
                                        <Label
                                            htmlFor="display_name"
                                            className="text-xs font-medium"
                                        >
                                            Display Name
                                        </Label>
                                        <Input
                                            id="display_name"
                                            name="display_name"
                                            placeholder="My Laravel App"
                                            value={data.display_name}
                                            onChange={(e) =>
                                                setData('display_name', e.target.value)
                                            }
                                            className="text-xs"
                                        />
                                        <InputError message={errors.display_name} />
                                    </div>

                                    {/* Branch */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="branch" className="text-xs font-medium">
                                            Branch
                                        </Label>
                                        <Select
                                            value={data.branch}
                                            onValueChange={(val) => setData('branch', val)}
                                        >
                                            <SelectTrigger id="branch" className="text-xs">
                                                <SelectValue placeholder="Select branch" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="main">main</SelectItem>
                                                <SelectItem value="develop">develop</SelectItem>
                                                <SelectItem value="staging">staging</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.branch} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Region */}
                                        <div className="grid gap-2">
                                            <Label
                                                htmlFor="region"
                                                className="text-xs font-medium"
                                            >
                                                Region
                                            </Label>
                                            <Select
                                                value={data.region}
                                                onValueChange={(val) => setData('region', val)}
                                            >
                                                <SelectTrigger id="region" className="text-xs">
                                                    <SelectValue placeholder="Select region" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {regions.map((r) => (
                                                        <SelectItem key={r.value} value={r.value}>
                                                            {r.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.region} />
                                        </div>

                                        {/* Compute Size */}
                                        <div className="grid gap-2">
                                            <Label
                                                htmlFor="compute_size"
                                                className="text-xs font-medium"
                                            >
                                                Compute Size
                                            </Label>
                                            <Select
                                                value={data.compute_size}
                                                onValueChange={(val) =>
                                                    setData('compute_size', val)
                                                }
                                            >
                                                <SelectTrigger
                                                    id="compute_size"
                                                    className="text-xs"
                                                >
                                                    <SelectValue placeholder="Select compute size" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {computeSizes.map((cs) => (
                                                        <SelectItem
                                                            key={cs.value}
                                                            value={cs.value}
                                                        >
                                                            {cs.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.compute_size} />
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="bg-blue-600 text-xs text-white hover:bg-blue-700"
                                        >
                                            {processing ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Deploying...
                                                </>
                                            ) : (
                                                <>Deploy {selectedRepo}</>
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </form>
                ) : (
                    <Card className="border-border/80 p-6 text-center shadow-xs">
                        <p className="text-xs text-muted-foreground">
                            Starter templates for Laravel 11/12, Next.js, and Node.js are ready
                            for quick one-click deployment.
                        </p>
                    </Card>
                )}
            </div>
        </>
    );
}

CreateApplication.layout = (props: any) => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: props.currentTeam ? `/${props.currentTeam.slug}/dashboard` : '/',
        },
        {
            title: 'Applications',
            href: props.currentTeam ? `/${props.currentTeam.slug}/applications` : '#',
        },
        {
            title: 'Create',
            href: '#',
        },
    ],
});
