import { Link, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
    activeTab: 'overview' | 'applications' | 'resources' | 'usage' | 'settings';
    onToggleDemo?: () => void;
    viewMode?: 'list' | 'empty';
};

export default function ApplicationsTopNav({ activeTab, onToggleDemo, viewMode }: Props) {
    const page = usePage();
    const currentTeam = (page.props as Record<string, any>).currentTeam;
    const teamSlug = currentTeam?.slug || 'default';

    return (
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center space-x-6 text-sm font-medium">
                <Link
                    href={`/${teamSlug}/applications`}
                    className={`transition-colors ${
                        activeTab === 'overview'
                            ? 'relative border-b-2 border-primary pb-3 font-semibold text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    Overview
                </Link>
                <Link
                    href={`/${teamSlug}/applications/list`}
                    className={`transition-colors ${
                        activeTab === 'applications'
                            ? 'relative border-b-2 border-primary pb-3 font-semibold text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    Applications
                </Link>
                <Link
                    href={`/${teamSlug}/applications/resources`}
                    className={`transition-colors ${
                        activeTab === 'resources'
                            ? 'relative border-b-2 border-primary pb-3 font-semibold text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    Resources
                </Link>
                <Link
                    href={`/${teamSlug}/applications/usage`}
                    className={`transition-colors ${
                        activeTab === 'usage'
                            ? 'relative border-b-2 border-primary pb-3 font-semibold text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    Usage
                </Link>
                <Link
                    href={`/${teamSlug}/applications/settings`}
                    className={`transition-colors ${
                        activeTab === 'settings'
                            ? 'relative border-b-2 border-primary pb-3 font-semibold text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    Settings
                </Link>
            </div>

            <div className="flex items-center gap-2">
                {onToggleDemo && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onToggleDemo}
                        className="h-7 text-xs text-muted-foreground"
                    >
                        Toggle Demo State ({viewMode === 'list' ? 'Show Empty' : 'Show List'})
                    </Button>
                )}
                <Button
                    size="sm"
                    asChild
                    className="h-8 gap-1.5 bg-neutral-900 text-xs text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                >
                    <Link href={`/${teamSlug}/applications/create`}>
                        <Plus className="h-4 w-4" />
                        New application
                    </Link>
                </Button>
            </div>
        </div>
    );
}
