import { Head, usePage } from '@inertiajs/react';
import { Check, Copy } from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { useClipboard } from '@/hooks/use-clipboard';
import { dashboard } from '@/routes';
import type { Auth, Team } from '@/types';

type PageProps = {
    auth: Auth;
    currentTeam: Team | null;
};

function CopyableField({
    label,
    value,
    id,
}: {
    label: string;
    value: string;
    id: string;
}) {
    const [copiedText, copy] = useClipboard();
    const isCopied = copiedText === value;

    return (
        <div className="space-y-1.5">
            <label
                htmlFor={id}
                className="text-xs font-medium text-muted-foreground"
            >
                {label}
            </label>
            <div className="flex items-stretch overflow-hidden rounded-md border border-border">
                <input
                    id={id}
                    type="text"
                    readOnly
                    value={value}
                    className="h-full w-full bg-muted/50 px-3 py-2 font-mono text-xs text-foreground outline-none"
                />
                <button
                    type="button"
                    onClick={() => copy(value)}
                    className="flex shrink-0 items-center border-l border-border px-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    data-test={`copy-${id}`}
                >
                    {isCopied ? (
                        <Check className="size-3.5 text-green-500" />
                    ) : (
                        <Copy className="size-3.5" />
                    )}
                </button>
            </div>
        </div>
    );
}

export default function Dashboard() {
    const { auth, currentTeam } = usePage<PageProps>().props;

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 lg:flex-row">
                <div className="flex flex-1 flex-col gap-4">
                    <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                        <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                            <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                        </div>
                        <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                            <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                        </div>
                        <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                            <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                        </div>
                    </div>
                    <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                </div>

                <div className="w-full shrink-0 lg:w-72">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">
                                API
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {currentTeam ? (
                                <CopyableField
                                    id="account-id"
                                    label="Account ID"
                                    value={currentTeam.uuid}
                                />
                            ) : null}
                            <CopyableField
                                id="user-id"
                                label="User ID"
                                value={auth.user.uuid}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = (props: { currentTeam?: { slug: string } | null }) => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: props.currentTeam ? dashboard(props.currentTeam.slug) : '/',
        },
    ],
});
