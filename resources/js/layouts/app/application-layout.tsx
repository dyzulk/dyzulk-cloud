import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { ApplicationSidebar } from '@/components/application-sidebar';
import type { AppLayoutProps } from '@/types';

type ApplicationLayoutProps = AppLayoutProps & {
    applicationName?: string;
    environment?: string;
    status?: 'live' | 'deploying' | 'failed' | 'idle';
};

export default function ApplicationLayout({
    children,
    breadcrumbs = [],
    applicationName = 'laravel-starter',
    environment = 'production',
    status = 'live',
}: ApplicationLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <ApplicationSidebar
                applicationName={applicationName}
                environment={environment}
                status={status}
            />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
        </AppShell>
    );
}
