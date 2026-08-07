import { Head } from '@inertiajs/react';
import { Megaphone } from 'lucide-react';
import { index as marketingIndex } from '@/actions/App/Http/Controllers/Office/MarketingController';
import Heading from '@/components/heading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import { getRelativeUrl } from '@/lib/utils';

export default function MarketingIndex() {
    return (
        <>
            <Head title="Marketing" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 font-base">
                <Heading
                    title="Marketing"
                    description="Manage campaigns, analytics, and marketing strategies."
                />

                <Card className="flex flex-1 flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Megaphone className="h-5 w-5" />
                            Marketing Overview
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-1 items-center justify-center">
                        <Empty>
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <Megaphone />
                                </EmptyMedia>
                                <EmptyTitle>No Marketing Data</EmptyTitle>
                                <EmptyDescription>
                                    Campaigns, performance metrics, and
                                    marketing analytics will appear here once
                                    configured.
                                </EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

MarketingIndex.layout = {
    breadcrumbs: [
        {
            title: 'Marketing',
            href: getRelativeUrl(marketingIndex.url()),
        },
    ],
};
