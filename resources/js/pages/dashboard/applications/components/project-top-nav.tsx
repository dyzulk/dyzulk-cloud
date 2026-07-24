import { Link, usePage } from '@inertiajs/react';

type Props = {
    applicationName: string;
    activeTab: 'overview' | 'deployments' | 'commands' | 'logs' | 'metrics' | 'resources' | 'env-vars' | 'settings';
};

export default function ProjectTopNav({ applicationName, activeTab }: Props) {
    const page = usePage();
    const currentTeam = (page.props as Record<string, any>).currentTeam;
    const teamSlug = currentTeam?.slug || 'default';
    const baseUrl = `/${teamSlug}/applications/${applicationName}`;

    const tabs = [
        { id: 'overview', label: 'Overview', href: `${baseUrl}/overview` },
        { id: 'deployments', label: 'Deployments', href: `${baseUrl}/deployments` },
        { id: 'commands', label: 'Commands', href: `${baseUrl}/commands` },
        { id: 'logs', label: 'Logs', href: `${baseUrl}/logs` },
        { id: 'metrics', label: 'Metrics', href: `${baseUrl}/metrics` },
        { id: 'resources', label: 'Resources', href: `${baseUrl}/resources` },
        { id: 'env-vars', label: 'Env Vars', href: `${baseUrl}/env-vars` },
        { id: 'settings', label: 'Settings', href: `${baseUrl}/settings` },
    ];

    return (
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center space-x-6 text-sm font-medium">
                {tabs.map((tab) => (
                    <Link
                        key={tab.id}
                        href={tab.href}
                        className={`transition-colors ${
                            activeTab === tab.id
                                ? 'relative border-b-2 border-primary pb-3 font-semibold text-foreground'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        {tab.label}
                    </Link>
                ))}
            </div>
        </div>
    );
}
