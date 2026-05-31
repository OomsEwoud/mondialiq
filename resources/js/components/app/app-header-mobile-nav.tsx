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
import type { NavItem } from '@/types';

type Props = {
    items: NavItem[];
};

export default function AppHeaderMobileNav({ items }: Props) {
    return (
        <div className="lg:hidden">
            <Sheet>
                <SheetTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="mr-2 h-[34px] w-[34px]"
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent
                    side="left"
                    className="flex h-full w-64 flex-col bg-sidebar"
                >
                    <SheetTitle className="sr-only">Navigation menu</SheetTitle>
                    <SheetHeader className="flex justify-start text-left">
                        <AppLogo textClassName="text-sidebar-foreground" />
                    </SheetHeader>
                    <nav className="flex flex-1 flex-col space-y-4 p-4 text-sm">
                        {items.map((item) => (
                            <Link
                                key={item.title}
                                href={item.href}
                                className="flex items-center space-x-2 font-medium"
                            >
                                {item.icon && <item.icon className="h-5 w-5" />}
                                <span>{item.title}</span>
                            </Link>
                        ))}
                    </nav>
                </SheetContent>
            </Sheet>
        </div>
    );
}
