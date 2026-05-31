import { Link } from '@inertiajs/react';
import { navItems } from '@/const/navigation';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';

interface Props {
    onNavigate?: () => void;
}

export default function NavApp({ onNavigate }: Props) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <nav className="flex w-full flex-col items-start gap-1.5 md:w-auto md:flex-row md:items-center md:gap-1">
            {navItems.map(({ label, href }) => {
                const isActive = isCurrentOrParentUrl(href);
                const url = toUrl(href);

                return (
                    <Link
                        key={url}
                        href={href}
                        onClick={onNavigate}
                        aria-current={isActive ? 'page' : undefined}
                        className={cn(
                            'group relative flex w-auto items-center rounded-xl px-3 py-2 text-sm font-semibold transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#141c69] focus-visible:outline-none md:justify-center md:rounded-full md:px-4',
                            isActive
                                ? 'bg-cyan-400/15 text-cyan-200 ring-1 ring-cyan-200/15'
                                : 'text-blue-100 hover:bg-white/5 hover:text-white',
                        )}
                    >
                        <span
                            className={cn(
                                'mr-2 h-4 w-0.5 rounded-full bg-cyan-300 transition-opacity duration-200 md:hidden',
                                isActive ? 'opacity-100' : 'opacity-0',
                            )}
                        />
                        {label}
                        <span
                            className={cn(
                                'absolute right-4 bottom-1.5 left-4 hidden h-0.5 rounded-full bg-cyan-300 transition-opacity duration-200 md:block',
                                isActive
                                    ? 'opacity-90'
                                    : 'opacity-0 group-hover:opacity-50',
                            )}
                        />
                    </Link>
                );
            })}
        </nav>
    );
}
