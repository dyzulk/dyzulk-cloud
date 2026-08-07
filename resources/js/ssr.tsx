import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import ReactDOMServer from 'react-dom/server';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';
import OfficeAuthLayout from '@/layouts/office-auth-layout';
import OfficeLayout from '@/layouts/office-layout';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createServer((page) =>
    createInertiaApp({
        page,
        render: ReactDOMServer.renderToString,
        title: (title) => {
            const isOffice = page.component.startsWith('office/');
            if (isOffice) {
                return title
                    ? `${title} - ${appName} Office`
                    : `${appName} Office`;
            }
            return title ? `${title} - ${appName}` : appName;
        },
        resolve: (name) => {
            const pages = import.meta.glob('./pages/**/*.tsx', { eager: true });
            return pages[`./pages/${name}.tsx`] as any;
        },
        layout: (name) => {
            if (name.startsWith('office/')) {
                switch (true) {
                    case name.startsWith('office/auth/'):
                        return OfficeAuthLayout;
                    default:
                        return OfficeLayout;
                }
            } else {
                switch (true) {
                    case name === 'marketing/welcome':
                        return null;
                    case name.startsWith('auth/'):
                        return AuthLayout;
                    case name.startsWith('dashboard/settings/'):
                    case name.startsWith('dashboard/teams/'):
                        return [AppLayout, SettingsLayout];
                    default:
                        return AppLayout;
                }
            }
        },
        setup: ({ App, props }) => (
            <TooltipProvider delayDuration={0}>
                <App {...props} />
                <Toaster />
            </TooltipProvider>
        ),
    }),
);

