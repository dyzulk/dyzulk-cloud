import { Head } from '@inertiajs/react';
import { DollarSign } from 'lucide-react';
import { index as financeIndex } from '@/actions/App/Http/Controllers/Office/FinanceController';
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

export default function FinanceIndex() {
    return (
        <>
            <Head title="Finance" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 font-base">
                <Heading
                    title="Finance"
                    description="Manage invoices, budgets, and financial reports."
                />

                <Card className="flex flex-1 flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5" />
                            Finance Overview
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-1 items-center justify-center">
                        <Empty>
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <DollarSign />
                                </EmptyMedia>
                                <EmptyTitle>No Finance Data</EmptyTitle>
                                <EmptyDescription>
                                    Financial records, invoices, and budget
                                    reports will appear here once configured.
                                </EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

FinanceIndex.layout = {
    breadcrumbs: [
        {
            title: 'Finance',
            href: getRelativeUrl(financeIndex.url()),
        },
    ],
};
