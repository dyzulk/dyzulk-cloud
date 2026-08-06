import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { home } from '@/routes';

export default function AuthCardLayout({
    children,
    title,
    description,
}: PropsWithChildren<{
    name?: string;
    title?: string;
    description?: string;
}>) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10 font-base selection:bg-main selection:text-main-foreground">
            <div className="flex w-full max-w-md flex-col gap-6">
                <Link
                    href={home()}
                    className="flex items-center gap-2 self-center font-medium hover:-translate-y-0.5 transition-transform"
                >
                    <div className="flex h-12 w-12 items-center justify-center rounded-base bg-main border-2 border-border shadow-shadow">
                        <AppLogoIcon className="size-7 fill-current text-main-foreground" />
                    </div>
                </Link>

                <div className="flex flex-col gap-6">
                    <Card className="rounded-base border-2 border-border shadow-shadow bg-secondary-background">
                        <CardHeader className="px-8 pt-8 pb-0 text-center">
                            <CardTitle className="text-2xl font-heading font-bold text-foreground">{title}</CardTitle>
                            <CardDescription className="text-foreground/70">{description}</CardDescription>
                        </CardHeader>
                        <CardContent className="px-8 py-8">
                            {children}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
