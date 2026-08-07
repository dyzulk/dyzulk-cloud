import { Head } from '@inertiajs/react';
import { Briefcase } from 'lucide-react';
import { index as planningIndex } from '@/actions/App/Http/Controllers/Office/PlanningController';
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

export default function PlanningIndex() {
    return (
        <>
            <Head title="Planning" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 font-base">
                <Heading
                    title="Planning"
                    description="Manage project plans, timelines, and resource allocation."
                />

                <Card className="flex flex-1 flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Briefcase className="h-5 w-5" />
                            Planning Overview
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-1 items-center justify-center">
                        <Empty>
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <Briefcase />
                                </EmptyMedia>
                                <EmptyTitle>No Planning Data</EmptyTitle>
                                <EmptyDescription>
                                    Project plans, schedules, and resource
                                    allocations will appear here once
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

PlanningIndex.layout = {
    breadcrumbs: [
        {
            title: 'Planning',
            href: getRelativeUrl(planningIndex.url()),
        },
    ],
};
