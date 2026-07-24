import { Head, Link, usePage } from '@inertiajs/react';
import { Check, Folder, Search } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';

export default function CreateApplication() {
    const page = usePage();
    const currentTeam = (page.props as Record<string, any>).currentTeam;
    const teamSlug = currentTeam?.slug || 'default';

    const [activeTab, setActiveTab] = useState<'import' | 'template'>('import');
    const [selectedRepo, setSelectedRepo] = useState('dyzulk/laravel-starter');
    const [searchQuery, setSearchQuery] = useState('');

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

    const filteredRepos = repositories.filter((r) =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <Head title="Create Application" />

            <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
                <div className="text-center space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Create your first application
                    </h1>
                    <p className="text-xs text-muted-foreground">
                        Select a repository, or start with a template.
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
                    <Card className="border-border/80 shadow-xs">
                        <CardHeader className="border-b border-border/40 px-6 py-4">
                            <CardTitle className="text-sm font-semibold">
                                Select Repository
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Choose a GitHub repository to deploy to your cloud cluster.
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
                            <div className="max-h-64 overflow-y-auto rounded-lg border border-border/80 divide-y divide-border/40">
                                {filteredRepos.map((repo) => (
                                    <div
                                        key={repo.name}
                                        onClick={() => setSelectedRepo(`dyzulk/${repo.name}`)}
                                        className={`flex cursor-pointer items-center justify-between p-3 transition-colors hover:bg-muted/40 ${
                                            selectedRepo === `dyzulk/${repo.name}` ? 'bg-primary/5' : ''
                                        }`}
                                    >
                                        <div className="flex items-center space-x-2.5">
                                            <Folder className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-xs font-semibold text-foreground">
                                                dyzulk/{repo.name}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                                            <span>{repo.updated}</span>
                                            {selectedRepo === `dyzulk/${repo.name}` && (
                                                <Check className="h-4 w-4 text-primary" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button
                                    asChild
                                    className="bg-blue-600 text-white hover:bg-blue-700 text-xs"
                                >
                                    <Link href={`/${teamSlug}/applications/laravel-starter/overview`}>
                                        Deploy {selectedRepo}
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border-border/80 p-6 text-center shadow-xs">
                        <p className="text-xs text-muted-foreground">
                            Starter templates for Laravel 11/12, Next.js, and Node.js are ready for quick one-click deployment.
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
    children: (page: React.ReactNode) => <AppLayout>{page}</AppLayout>,
});
