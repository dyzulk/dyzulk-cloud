import { Head } from '@inertiajs/react';
import { BarChart3 } from 'lucide-react';
import { index as reportsIndex } from '@/actions/App/Http/Controllers/Office/ReportsController';
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

export default function ReportsIndex() {
    return (
        <>
            <Head title="Reports" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 font-base">
                <Heading
                    title="Reports"
                    description="View and generate business reports and analytics."
                />

                <Card className="flex flex-1 flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Reports Overview
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-1 items-center justify-center">
                        <Empty>
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <BarChart3 />
                                </EmptyMedia>
                                <EmptyTitle>No Reports Available</EmptyTitle>
                                <EmptyDescription>
                                    Business reports, analytics dashboards, and
                                    data summaries will appear here once
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

ReportsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Reports',
            href: getRelativeUrl(reportsIndex.url()),
        },
    ],
};
