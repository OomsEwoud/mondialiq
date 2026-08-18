import { Link } from '@inertiajs/react';
import { navItems } from '@/const/navigation';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';

interface Props {
    className?: string;
    onNavigate?: () => void;
}

export default function NavApp({ className, onNavigate }: Props) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <nav
            aria-label="Main"
            className={cn(
                'flex w-full flex-col items-start gap-0.5 md:w-auto md:flex-row md:items-center md:gap-0.5',
                className,
            )}
        >
            {navItems.map(({ label, href }) => {
                const isActive = isCurrentOrParentUrl(href);
                const url = toUrl(href);

                return (
                    <Link
                        key={url}
                        href={url}
                        onClick={onNavigate}
                        aria-current={isActive ? 'page' : undefined}
                        className={cn(
                            'relative flex w-auto items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[#36a96b] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0e0d] focus-visible:outline-none md:px-3',
                            isActive
                                ? 'bg-[#171c19] text-white'
                                : 'text-[#949d97] hover:bg-[#141916] hover:text-white',
                        )}
                    >
                        <span
                            className={cn(
                                'mr-2 h-4 w-0.5 rounded-full bg-[#57ad78] transition-opacity duration-200 md:hidden',
                                isActive ? 'opacity-100' : 'opacity-0',
                            )}
                        />
                        {label}
                        <span
                            className={cn(
                                'absolute right-3 bottom-0 left-3 hidden h-px rounded-full bg-[#57ad78] transition-opacity duration-200 md:block',
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
