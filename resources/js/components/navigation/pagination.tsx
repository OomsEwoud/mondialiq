import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';

interface Props {
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

export default function Pagination({ links }: Props) {
    const pageLinks = links.filter(
        (link) =>
            !link.label.includes('Previous') && !link.label.includes('Next'),
    );

    if (pageLinks.length <= 1) {
        return null;
    }

    return (
        <nav
            className="mt-8 flex flex-wrap justify-center gap-1.5"
            aria-label="Pagination"
        >
            {links.map((link) => {
                const key = `${link.label}-${link.url ?? 'disabled'}`;
                const className = cn(
                    'inline-flex min-h-10 min-w-10 items-center justify-center rounded-md border px-3 text-sm font-bold transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                    link.active
                        ? 'border-[#edf1ed] bg-crest-surface text-background'
                        : 'border-border-strong bg-surface text-muted-foreground hover:border-border-strong hover:bg-surface-interactive hover:text-foreground',
                    !link.url &&
                        'cursor-not-allowed border-border-subtle bg-surface text-text-muted opacity-100 hover:border-border-subtle hover:bg-surface hover:text-text-muted',
                );

                if (!link.url) {
                    return (
                        <span
                            key={key}
                            aria-disabled="true"
                            className={className}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    );
                }

                return (
                    <Link
                        key={key}
                        href={link.url}
                        aria-current={link.active ? 'page' : undefined}
                        className={className}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                        preserveScroll
                    />
                );
            })}
        </nav>
    );
}
