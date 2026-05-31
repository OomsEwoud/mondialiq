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
    'text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100';

export default function AppHeaderDesktopNav({ items }: Props) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <div className="ml-6 hidden h-full items-center space-x-6 lg:flex">
            <NavigationMenu className="flex h-full items-stretch">
                <NavigationMenuList className="flex h-full items-stretch space-x-2">
                    {items.map((item) => (
                        <NavigationMenuItem
                            key={item.title}
                            className="relative flex h-full items-center"
                        >
                            <Link
                                href={item.href}
                                className={cn(
                                    navigationMenuTriggerStyle(),
                                    isCurrentOrParentUrl(item.href) &&
                                        activeItemStyles,
                                    'h-9 cursor-pointer px-3',
                                )}
                            >
                                {item.icon && (
                                    <item.icon className="mr-2 h-4 w-4" />
                                )}
                                {item.title}
                            </Link>
                            {isCurrentOrParentUrl(item.href) && (
                                <div className="absolute bottom-0 left-0 h-0.5 w-full translate-y-px bg-black dark:bg-white" />
                            )}
                        </NavigationMenuItem>
                    ))}
                </NavigationMenuList>
            </NavigationMenu>
        </div>
    );
}
