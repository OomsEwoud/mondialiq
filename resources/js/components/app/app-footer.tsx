import { Link } from '@inertiajs/react';
import { contact, howItWorks, privacy, scoring } from '@/routes';

export default function AppFooter() {
    return (
        <footer className="mt-auto border-t border-border px-4 py-6 sm:px-8">
            <div className="mx-auto flex max-w-7xl flex-col gap-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                <p>MondialIQ · Voetbal, inzicht en jouw voorspelling.</p>
                <nav
                    aria-label="Hulp en informatie"
                    className="flex flex-wrap gap-x-5 gap-y-2"
                >
                    <Link
                        className="inline-flex min-h-9 items-center hover:text-foreground"
                        href={howItWorks()}
                    >
                        Hoe het werkt
                    </Link>
                    <Link
                        className="inline-flex min-h-9 items-center hover:text-foreground"
                        href={scoring()}
                    >
                        Puntentelling
                    </Link>
                    <Link
                        className="inline-flex min-h-9 items-center hover:text-foreground"
                        href={contact()}
                    >
                        Contact
                    </Link>
                    <Link
                        className="inline-flex min-h-9 items-center hover:text-foreground"
                        href={privacy()}
                    >
                        Privacy
                    </Link>
                </nav>
            </div>
        </footer>
    );
}
