export function formatProviderName(provider?: string | null): string | null {
    if (!provider) {
        return null;
    }

    return provider.charAt(0).toUpperCase() + provider.slice(1);
}
