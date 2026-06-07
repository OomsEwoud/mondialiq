import { Link } from '@inertiajs/react';

import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation/navigation-menu';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';
import type { NavItem } from '@/types';

type Props = {
    items: NavItem[];
};

const activeItemStyles =
    'border-cyan-300/40 bg-white/12 text-white shadow-sm';

export default function AppHeaderDesktopNav({ items }: Props) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <div className="ml-6 hidden h-full items-center space-x-4 lg:flex">
            <NavigationMenu className="flex h-full items-stretch">
                <NavigationMenuList className="flex h-full items-center space-x-1.5">
                    {items.map((item) => (
                        <NavigationMenuItem
                            key={item.title}
                            className="relative flex h-full items-center"
                        >
                            <Link
                                href={item.href}
                                className={cn(
                                    navigationMenuTriggerStyle(),
                                    'h-9 cursor-pointer rounded-full border border-transparent bg-transparent px-3 text-sm font-bold text-blue-100 transition-colors hover:border-white/15 hover:bg-white/8 hover:text-white focus-visible:ring-cyan-300',
                                    isCurrentOrParentUrl(item.href) &&
                                        activeItemStyles,
                                )}
                            >
                                {item.icon && (
                                    <item.icon className="mr-2 h-4 w-4" />
                                )}
                                {item.title}
                            </Link>
                            {isCurrentOrParentUrl(item.href) && (
                                <div className="absolute bottom-1 left-1/2 h-1 w-5 -translate-x-1/2 rounded-full bg-cyan-300" />
                            )}
                        </NavigationMenuItem>
                    ))}
                </NavigationMenuList>
            </NavigationMenu>
        </div>
    );
}
