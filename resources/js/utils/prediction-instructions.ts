const key = 'predictions-info-expanded';
const changeEvent = 'prediction-instructions-change';

export function subscribeToInstructions(onChange: () => void) {
    window.addEventListener('storage', onChange);
    window.addEventListener(changeEvent, onChange);

    return () => {
        window.removeEventListener('storage', onChange);
        window.removeEventListener(changeEvent, onChange);
    };
}

let fallback = false;

export function instructionsExpanded(): boolean {
    try {
        return localStorage.getItem(key) === 'true';
    } catch {
        return fallback;
    }
}

export function instructionsServerSnapshot(): boolean {
    return false;
}

export function setInstructionsExpanded(expanded: boolean) {
    fallback = expanded;

    try {
        localStorage.setItem(key, String(expanded));
    } catch {
        // Keep the disclosure usable when browser storage is unavailable.
    }

    window.dispatchEvent(new Event(changeEvent));
}
