import { useEffect, useState } from 'react';

export function usePageVisibility(): boolean {
    const [isVisible, setIsVisible] = useState(isDocumentVisible);

    useEffect(() => {
        if (!supportsPageVisibility()) {
            return;
        }

        const handleVisibilityChange = () => {
            setIsVisible(isDocumentVisible());
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        handleVisibilityChange();

        return () => {
            document.removeEventListener(
                'visibilitychange',
                handleVisibilityChange,
            );
        };
    }, []);

    return isVisible;
}

function isDocumentVisible(): boolean {
    if (!supportsPageVisibility()) {
        return true;
    }

    return document.visibilityState === 'visible' && !document.hidden;
}

function supportsPageVisibility(): boolean {
    return (
        typeof document !== 'undefined' &&
        'visibilityState' in document &&
        'hidden' in document
    );
}
