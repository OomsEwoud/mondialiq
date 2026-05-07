import { Link } from '@inertiajs/react';

interface Props {
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

export default function Pagination({ links }: Props) {
    return (
        <div className="mt-8 flex flex-wrap justify-center gap-1">
            {links.map((link, index) => (
                <Link
                    key={index}
                    href={link.url || '#'}
                    className={`rounded-lg border px-4 py-2 text-sm ${
                        link.active
                            ? 'border-rose-600 bg-rose-600 text-white'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    } ${!link.url ? 'cursor-not-allowed opacity-50' : ''}`}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                    preserveScroll
                />
            ))}
        </div>
    );
}
