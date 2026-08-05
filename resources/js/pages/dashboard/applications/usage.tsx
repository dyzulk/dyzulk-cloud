import { Head } from '@inertiajs/react';
import { Activity } from 'lucide-react';
import ApplicationsTopNav from './components/top-nav';

export default function ApplicationsUsage() {
    return (
        <>
            <Head title="Usage" />

            <div className="flex flex-col gap-6 p-6">
                <ApplicationsTopNav activeTab="usage" />

                <div className="flex min-h-[420px] flex-col items-center justify-center rounded-base border-2 border-dashed border-border bg-secondary-background shadow-shadow p-8 text-center">
                    <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-base border-2 border-border bg-main/20 p-4">
                        <Activity className="h-12 w-12 text-foreground" />
                    </div>
                    <h3 className="text-lg font-heading text-foreground">
                        Usage metrics unavailable
                    </h3>
                    <p className="mt-1 max-w-sm text-xs text-foreground/60">
                        Detailed bandwidth, storage, and build minutes usage will be displayed here.
                    </p>
                </div>
            </div>
        </>
    );
}

ApplicationsUsage.layout = (props: any) => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: props.currentTeam ? `/${props.currentTeam.slug}/dashboard` : '/',
        },
        {
            title: 'Applications',
            href: '#',
        },
    ],
});
