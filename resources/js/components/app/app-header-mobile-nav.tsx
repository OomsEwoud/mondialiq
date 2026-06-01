import { Link } from '@inertiajs/react';
import { Menu } from 'lucide-react';

import AppLogo from '@/components/app/app-logo';
import { Button } from '@/components/ui/forms/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/overlays/sheet';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';
import type { NavItem } from '@/types';

type Props = {
    items: NavItem[];
};

export default function AppHeaderMobileNav({ items }: Props) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <div className="lg:hidden">
            <Sheet>
                <SheetTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="mr-2 h-[38px] w-[38px] rounded-full text-blue-100 hover:bg-white/10 hover:text-white focus-visible:ring-cyan-300"
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent
                    side="left"
                    className="flex h-full w-72 flex-col border-white/10 bg-blue-950 text-white"
                >
                    <SheetTitle className="sr-only">Navigation menu</SheetTitle>
                    <SheetHeader className="flex justify-start text-left">
                        <AppLogo textClassName="text-white" />
                    </SheetHeader>
                    <nav className="flex flex-1 flex-col gap-2 p-4 text-sm">
                        {items.map((item) => {
                            const isActive = isCurrentOrParentUrl(item.href);

                            return (
                                <Link
                                    key={item.title}
                                    href={item.href}
                                    aria-current={isActive ? 'page' : undefined}
                                    className={cn(
                                        'flex items-center space-x-2 rounded-md px-3 py-2 font-medium transition-colors',
                                        isActive
                                            ? 'bg-cyan-300 text-blue-950'
                                            : 'text-blue-100 hover:bg-white/10 hover:text-white',
                                    )}
                                >
                                    {item.icon && (
                                        <item.icon className="h-5 w-5" />
                                    )}
                                    <span>{item.title}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </SheetContent>
            </Sheet>
        </div>
    );
}
