import { usePage } from '@inertiajs/react';
import { GitBranch, Globe, RefreshCw, Rocket } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ProjectTopNav from '@/pages/dashboard/applications/components/project-top-nav';
import type { AppLayoutProps } from '@/types';

type ApplicationLayoutProps = AppLayoutProps & {
    applicationName?: string;
    environment?: string;
    status?: 'live' | 'deploying' | 'failed' | 'idle';
};

export default function ApplicationLayout({
    children,
    applicationName = 'laravel-starter',
    environment = 'production',
    status = 'live',
}: ApplicationLayoutProps) {
    const page = usePage();
    const url = page.url.split('?')[0];
    const segments = url.split('/');
    
    // Determine activeTab from the URL path.
    // Paths are like: /team-slug/applications/laravel-starter/overview
    // If the last segment is the application name, fallback to overview
    let activeTab: any = segments[segments.length - 1];
    if (activeTab === applicationName) {
        activeTab = 'overview';
    }

    const getStatusBadge = () => {
        switch (status) {
            case 'live':
                return (
                    <Badge variant="outline" className="gap-1.5 border-emerald-500/30 bg-emerald-500/10 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                        Live
                    </Badge>
                );
            case 'deploying':
                return (
                    <Badge variant="outline" className="gap-1.5 border-amber-500/30 bg-amber-500/10 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                        <span className="h-1.5 w-1.5 animate-ping rounded-full bg-amber-500" />
                        Deploying
                    </Badge>
                );
            case 'failed':
                return (
                    <Badge variant="outline" className="gap-1.5 border-rose-500/30 bg-rose-500/10 text-[11px] font-medium text-rose-600 dark:text-rose-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                        Failed
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="text-[11px] text-muted-foreground">
                        Idle
                    </Badge>
                );
        }
    };

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header Banner (Laravel Cloud Style) */}
            <div className="flex flex-col justify-between gap-4 border-b border-border/60 pb-5 md:flex-row md:items-center">
                <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            {applicationName}
                        </h1>
                        <Badge variant="secondary" className="font-mono text-xs">
                            {environment}
                        </Badge>
                        {getStatusBadge()}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <GitBranch className="h-3.5 w-3.5" />
                            dyzulk/{applicationName}:main
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                            <Globe className="h-3.5 w-3.5" />
                            Asia Pacific (Singapore)
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-1.5">
                        <RefreshCw className="h-3.5 w-3.5" />
                        Redeploy
                    </Button>
                    <Button size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white">
                        <Rocket className="h-3.5 w-3.5" />
                        Deploy
                    </Button>
                </div>
            </div>

            {/* Project Top Nav */}
            <ProjectTopNav applicationName={applicationName} activeTab={activeTab} />

            {/* Page Content */}
            <div className="space-y-6">
                {children}
            </div>
        </div>
    );
}
