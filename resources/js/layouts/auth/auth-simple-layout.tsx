import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10 font-base selection:bg-main selection:text-main-foreground">
            <div className="w-full max-w-md">
                <div className="bg-secondary-background border-2 border-border rounded-base p-8 md:p-10 shadow-shadow flex flex-col gap-6">
                    <div className="flex flex-col items-center gap-4">
                        <Link
                            href={home()}
                            className="flex flex-col items-center gap-2 hover:-translate-y-0.5 transition-transform"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-base bg-main border-2 border-border shadow-shadow">
                                <AppLogoIcon className="size-7 fill-current text-main-foreground" />
                            </div>
                            <span className="sr-only">{title}</span>
                        </Link>

                        <div className="space-y-1.5 text-center">
                            <h1 className="text-2xl font-heading font-bold text-foreground">{title}</h1>
                            <p className="text-center text-sm text-foreground/70">
                                {description}
                            </p>
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
