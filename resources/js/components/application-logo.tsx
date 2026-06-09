import React from 'react';

export default function ApplicationLogo(props: React.ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <>
            <img
                src="/images/logoipsum-circular-brand.svg"
                alt="Application Logo"
                className="block dark:hidden"
                {...props}
            />
            <img
                src="/images/logoipsum-circular-brand.svg"
                alt="Application Logo (Dark)"
                className="hidden dark:block"
                {...props}
            />
        </>
    );
}
