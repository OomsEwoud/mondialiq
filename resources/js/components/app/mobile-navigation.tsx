import { Menu } from 'lucide-react';
import { useState } from 'react';
import NavApp from '@/components/navigation/nav-app';
import { Button } from '@/components/ui/forms/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetTrigger,
} from '@/components/ui/overlays/sheet';

export default function MobileNavigation() {
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    className="size-11 lg:hidden"
                    aria-label="Open navigatie"
                >
                    <Menu className="size-5" />
                </Button>
            </SheetTrigger>
            <SheetContent
                side="right"
                className="w-[min(90vw,22rem)] overflow-y-auto p-5"
            >
                <SheetHeader className="px-0 pt-7">
                    <SheetTitle>MondialIQ</SheetTitle>
                    <SheetDescription>
                        Jouw wedstrijd, jouw voorspelling.
                    </SheetDescription>
                </SheetHeader>
                <NavApp mobile onNavigate={() => setOpen(false)} />
            </SheetContent>
        </Sheet>
    );
}
