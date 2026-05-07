import { usePage, Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/feedback/badge';

const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Matches', href: '/matches' },
    { label: 'Groups', href: '/groups' },
    { label: 'Predictions', href: '/predictions' },
];

interface Props {
    onNavigate?: () => void;
}

export default function NavApp({ onNavigate }: Props) {
    const { url } = usePage();

    return (
        <nav className="flex w-full flex-col items-start gap-2 md:w-auto md:flex-row md:items-center md:gap-8">
            {navItems.map(({ label, href }) => {

                const isActive = href === '/' ? url === '/' : url.startsWith(href);

                return isActive ? (
                    <Badge
                        key={href}
                        className="cursor-pointer rounded-full bg-cyan-400 px-6 py-2 text-blue-950 font-bold hover:bg-cyan-300 w-full md:w-auto justify-center"
                    >
                        {label}
                    </Badge>
                ) : (
                    <Link
                        key={href}
                        href={href}
                        onClick={onNavigate}
                        className="cursor-pointer font-medium text-blue-200 transition-colors hover:text-cyan-400 w-full md:w-auto py-1"
                    >
                        {label}
                    </Link>
                );
            })}
        </nav>
    );
}
