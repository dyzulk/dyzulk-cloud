import { createInertiaApp } from '@inertiajs/react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import OfficeAuthLayout from '@/layouts/office-auth-layout';
import OfficeLayout from '@/layouts/office-layout';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) =>
        title ? `${title} - ${appName} Office` : `${appName} Office`,
    layout: (name) => {
        switch (true) {
            case name.startsWith('office/auth/'):
                return OfficeAuthLayout;
            default:
                return OfficeLayout;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                {app}
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
