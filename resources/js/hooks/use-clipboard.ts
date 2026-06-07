// Credit: https://usehooks-ts.com/
import { useEffect, useRef, useState } from 'react';

export type CopiedValue = string | null;
export type CopyFn = (text: string) => Promise<boolean>;
export type UseClipboardReturn = [CopiedValue, CopyFn];

export function useClipboard(timeout = 2000): UseClipboardReturn {
    const [copiedText, setCopiedText] = useState<CopiedValue>(null);
    const timeoutRef = useRef<number | null>(null);

    const copy: CopyFn = async (text) => {
        if (!navigator?.clipboard) {
            console.warn('Clipboard not supported');

            return false;
        }

        try {
            await navigator.clipboard.writeText(text);
            setCopiedText(text);

            if (timeoutRef.current) {
                window.clearTimeout(timeoutRef.current);
            }

            if (timeout > 0) {
                timeoutRef.current = window.setTimeout(() => {
                    setCopiedText(null);
                }, timeout);
            }

            return true;
        } catch (error) {
            console.warn('Copy failed', error);
            setCopiedText(null);

            return false;
        }
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                window.clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return [copiedText, copy];
}
