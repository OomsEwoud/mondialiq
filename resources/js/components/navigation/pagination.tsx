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
                    'inline-flex min-h-10 min-w-10 items-center justify-center rounded-md border px-3 text-sm font-bold transition-colors focus-visible:ring-2 focus-visible:ring-[#57ad78] focus-visible:outline-none',
                    link.active
                        ? 'border-[#edf1ed] bg-[#edf1ed] text-[#101412]'
                        : 'border-[#343d37] bg-[#111513] text-[#89928c] hover:border-[#536159] hover:bg-[#1a211d] hover:text-white',
                    !link.url &&
                        'cursor-not-allowed border-[#222824] bg-[#0d110f] text-[#48504b] opacity-100 hover:border-[#222824] hover:bg-[#0d110f] hover:text-[#48504b]',
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
