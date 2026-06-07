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
                    'inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm font-bold transition-colors focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none',
                    link.active
                        ? 'border-cyan-200 bg-cyan-50 text-cyan-700 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-950',
                    !link.url &&
                        'cursor-not-allowed bg-slate-50 text-slate-400 opacity-100 hover:bg-slate-50 hover:text-slate-400',
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
