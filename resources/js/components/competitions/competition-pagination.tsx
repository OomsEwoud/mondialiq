import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export type CompetitionPaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

export default function CompetitionPagination({
    links,
    label,
}: {
    links: CompetitionPaginationLink[];
    label: string;
}) {
    const pages = links.filter(
        (link) =>
            !link.label.includes('Previous') && !link.label.includes('Next'),
    );

    if (pages.length <= 1) {
        return null;
    }

    const previous = links.find((link) => link.label.includes('Previous'));
    const next = links.find((link) => link.label.includes('Next'));

    return (
        <nav
            aria-label={label}
            className="flex items-center justify-between gap-3 pt-4"
        >
            <PaginationArrow link={previous} direction="previous" />
            <div className="flex min-w-0 items-center justify-center gap-1">
                {pages.map((link, index) => {
                    if (link.label === '...') {
                        return (
                            <span
                                key={`ellipsis-${index}`}
                                aria-hidden="true"
                                className="px-1.5 text-xs text-text-muted"
                            >
                                …
                            </span>
                        );
                    }

                    return link.url ? (
                        <Link
                            key={`${link.label}-${index}`}
                            href={link.url}
                            preserveScroll
                            aria-label={`Pagina ${link.label}`}
                            aria-current={link.active ? 'page' : undefined}
                            className={`inline-flex size-8 items-center justify-center rounded-md text-xs transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
                                link.active
                                    ? 'bg-brand-subtle font-semibold text-positive'
                                    : 'text-muted-foreground hover:bg-surface-interactive hover:text-foreground'
                            }`}
                        >
                            {link.label}
                        </Link>
                    ) : (
                        <span
                            key={`${link.label}-${index}`}
                            aria-hidden="true"
                            className="inline-flex size-8 items-center justify-center text-xs text-text-muted"
                        >
                            {link.label}
                        </span>
                    );
                })}
            </div>
            <PaginationArrow link={next} direction="next" />
        </nav>
    );
}

function PaginationArrow({
    link,
    direction,
}: {
    link?: CompetitionPaginationLink;
    direction: 'previous' | 'next';
}) {
    const Icon = direction === 'previous' ? ChevronLeft : ChevronRight;
    const label =
        direction === 'previous' ? 'Vorige pagina' : 'Volgende pagina';
    const className =
        'inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none';

    return link?.url ? (
        <Link
            href={link.url}
            preserveScroll
            aria-label={label}
            className={`${className} hover:bg-surface-interactive hover:text-foreground`}
        >
            <Icon aria-hidden="true" className="size-4" />
        </Link>
    ) : (
        <span
            aria-label={label}
            aria-disabled="true"
            className={`${className} cursor-not-allowed opacity-40`}
        >
            <Icon aria-hidden="true" className="size-4" />
        </span>
    );
}
