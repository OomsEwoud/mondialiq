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
        <div className="mt-8 flex flex-wrap justify-center gap-1">
            {links.map((link, index) => {
                const className = cn(
                    'rounded-lg border px-4 py-2 text-sm',
                    link.active
                        ? 'border-rose-600 bg-rose-600 text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                    !link.url && 'cursor-not-allowed opacity-50',
                );

                if (!link.url) {
                    return (
                        <span
                            key={index}
                            className={className}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    );
                }

                return (
                    <Link
                        key={index}
                        href={link.url}
                        className={className}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                        preserveScroll
                    />
                );
            })}
        </div>
    );
}
