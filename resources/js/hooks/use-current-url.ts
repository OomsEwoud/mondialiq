import type { InertiaLinkProps } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { toUrl } from '@/lib/utils';

export type IsCurrentUrlFn = (
    urlToCheck: NonNullable<InertiaLinkProps['href']>,
    currentUrl?: string,
    startsWith?: boolean,
) => boolean;

export type IsCurrentOrParentUrlFn = (
    urlToCheck: NonNullable<InertiaLinkProps['href']>,
    currentUrl?: string,
) => boolean;

export type WhenCurrentUrlFn = <TIfTrue, TIfFalse = null>(
    urlToCheck: NonNullable<InertiaLinkProps['href']>,
    ifTrue: TIfTrue,
    ifFalse?: TIfFalse,
) => TIfTrue | TIfFalse;

export type UseCurrentUrlReturn = {
    currentUrl: string;
    isCurrentUrl: IsCurrentUrlFn;
    isCurrentOrParentUrl: IsCurrentOrParentUrlFn;
    whenCurrentUrl: WhenCurrentUrlFn;
};

export function useCurrentUrl(): UseCurrentUrlReturn {
    const page = usePage();
    const currentUrlPath = new URL(
        page.url,
        typeof window !== 'undefined'
            ? window.location.origin
            : 'http://localhost',
    ).pathname;
    const normalizePath = (path: string): string =>
        path === '/' ? path : path.replace(/\/+$/, '');

    const normalizeUrlPath = (
        urlToCheck: NonNullable<InertiaLinkProps['href']>,
    ): string | null => {
        const urlString = toUrl(urlToCheck);

        if (!urlString.startsWith('http')) {
            return normalizePath(urlString.split(/[?#]/)[0] ?? '/');
        }

        try {
            return normalizePath(new URL(urlString).pathname);
        } catch {
            return null;
        }
    };

    const isCurrentUrl: IsCurrentUrlFn = (
        urlToCheck: NonNullable<InertiaLinkProps['href']>,
        currentUrl?: string,
        startsWith: boolean = false,
    ) => {
        const urlToCompare = normalizePath(currentUrl ?? currentUrlPath);
        const normalizedPath = normalizeUrlPath(urlToCheck);

        const comparePath = (path: string): boolean =>
            startsWith
                ? path === '/'
                    ? urlToCompare === path
                    : urlToCompare === path ||
                      urlToCompare.startsWith(`${path}/`)
                : path === urlToCompare;

        if (!normalizedPath) {
            return false;
        }

        return comparePath(normalizedPath);
    };

    const isCurrentOrParentUrl: IsCurrentOrParentUrlFn = (
        urlToCheck: NonNullable<InertiaLinkProps['href']>,
        currentUrl?: string,
    ) => {
        return isCurrentUrl(urlToCheck, currentUrl, true);
    };

    const whenCurrentUrl: WhenCurrentUrlFn = <TIfTrue, TIfFalse = null>(
        urlToCheck: NonNullable<InertiaLinkProps['href']>,
        ifTrue: TIfTrue,
        ifFalse: TIfFalse = null as TIfFalse,
    ): TIfTrue | TIfFalse => {
        return isCurrentUrl(urlToCheck) ? ifTrue : ifFalse;
    };

    return {
        currentUrl: currentUrlPath,
        isCurrentUrl,
        isCurrentOrParentUrl,
        whenCurrentUrl,
    };
}
