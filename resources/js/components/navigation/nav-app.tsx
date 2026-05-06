import { usePage, Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/feedback/badge';

const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Matches', href: '/matches' },
    { label: 'Groups', href: '/groups' },
    { label: 'Predictions', href: '/predictions' },
];

export default function NavApp() {
    const { url } = usePage();

    return (
        <nav className="flex items-center gap-8">
            {navItems.map(({ label, href }) => {
                const isActive = url === href;

                return isActive ? (
                    <Badge
                        key={href}
                        className="cursor-pointer rounded-full bg-rose-600 px-6 py-2 text-white hover:bg-rose-700"
                    >
                        {label}
                    </Badge>
                ) : (
                    <Link
                        key={href}
                        href={href}
                        className="cursor-pointer font-medium text-slate-500 transition-colors hover:text-rose-600"
                    >
                        {label}
                    </Link>
                );
            })}
        </nav>
    );
}
