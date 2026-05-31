import { useEffect } from 'react';
import type * as React from 'react';

export function useOutsideClick(
    ref: React.RefObject<HTMLElement | null>,
    onClose: () => void,
    enabled: boolean,
) {
    useEffect(() => {
        if (!enabled) {
            return;
        }

        const handler = (event: MouseEvent) => {
            if (
                ref.current &&
                event.target instanceof Node &&
                !ref.current.contains(event.target)
            ) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handler);

        return () => document.removeEventListener('mousedown', handler);
    }, [enabled, onClose, ref]);
}
