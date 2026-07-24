import { Head } from '@inertiajs/react';
import { Activity } from 'lucide-react';
import ApplicationsTopNav from './components/top-nav';

export default function ApplicationsUsage() {
    return (
        <>
            <Head title="Usage" />

            <div className="flex flex-col gap-6 p-6">
                <ApplicationsTopNav activeTab="usage" />

                <div className="flex min-h-[420px] flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/10 p-8 text-center">
                    <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-2xl bg-muted/40 p-4 shadow-inner">
                        <Activity className="h-12 w-12 text-muted-foreground/60" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                        Usage metrics unavailable
                    </h3>
                    <p className="mt-1 max-w-sm text-xs text-muted-foreground">
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
