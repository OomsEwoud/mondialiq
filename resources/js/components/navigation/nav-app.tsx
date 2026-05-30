import { usePage, Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/feedback/badge';
import { navItems } from '@/const/navigation';

interface Props {
    onNavigate?: () => void;
}

export default function NavApp({ onNavigate }: Props) {
    const { url } = usePage();

    return (
        <nav className="flex w-full flex-col items-start gap-2 md:w-auto md:flex-row md:items-center md:gap-8">
            {navItems.map(({ label, href }) => {
                const isActive =
                    href === '/' ? url === '/' : url.startsWith(href);

                return isActive ? (
                    <Badge
                        key={href}
                        aria-current="page"
                        className="w-full justify-center rounded-full bg-cyan-400 px-6 py-2 font-bold text-blue-950 md:w-auto"
                    >
                        {label}
                    </Badge>
                ) : (
                    <Link
                        key={href}
                        href={href}
                        onClick={onNavigate}
                        className="w-full cursor-pointer py-1 font-medium text-blue-200 transition-colors hover:text-cyan-400 md:w-auto"
                    >
                        {label}
                    </Link>
                );
            })}
        </nav>
    );
}
