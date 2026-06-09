import React from 'react';
import { cn } from '@/lib/utils';

export default function ApplicationLogo({ className, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <>
            <img
                src="/images/logoipsum-circular-brand.svg"
                alt="Application Logo"
                className={cn("block dark:hidden", className)}
                {...props}
            />
            <img
                src="/images/logoipsum-circular-brand-dark.svg"
                alt="Application Logo (Dark)"
                className={cn("hidden dark:block", className)}
                {...props}
            />
        </>
    );
}
