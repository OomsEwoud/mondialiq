// Credit: https://usehooks-ts.com/
import { useEffect, useRef, useState } from 'react';

export type CopiedValue = string | null;
export type CopyFn = (text: string) => Promise<boolean>;
export type UseClipboardReturn = [CopiedValue, CopyFn];
const COPY_FEEDBACK_DURATION_MS = 2000;

export function useClipboard(): UseClipboardReturn {
    const [copiedText, setCopiedText] = useState<CopiedValue>(null);
    const resetTimeoutRef = useRef<number | null>(null);

    const copy: CopyFn = async (text) => {
        if (!navigator?.clipboard) {
            console.warn('Clipboard not supported');

            return false;
        }

        try {
            await navigator.clipboard.writeText(text);
            setCopiedText(text);

            if (resetTimeoutRef.current) {
                window.clearTimeout(resetTimeoutRef.current);
            }

            resetTimeoutRef.current = window.setTimeout(() => {
                setCopiedText(null);
                resetTimeoutRef.current = null;
            }, COPY_FEEDBACK_DURATION_MS);

            return true;
        } catch (error) {
            console.warn('Copy failed', error);
            setCopiedText(null);

            return false;
        }
    };

    useEffect(() => {
        return () => {
            if (resetTimeoutRef.current) {
                window.clearTimeout(resetTimeoutRef.current);
            }
        };
    }, []);

    return [copiedText, copy];
}
