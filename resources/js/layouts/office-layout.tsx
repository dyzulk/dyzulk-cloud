import OfficeSidebarLayout from '@/layouts/office/office-sidebar-layout';
import type { BreadcrumbItem } from '@/types';

export default function OfficeLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    return (
        <OfficeSidebarLayout breadcrumbs={breadcrumbs}>
            {children}
        </OfficeSidebarLayout>
    );
}
