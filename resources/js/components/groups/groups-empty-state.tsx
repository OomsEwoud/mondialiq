import { Link } from '@inertiajs/react';
import { ArrowRight, TableProperties } from 'lucide-react';
import { matches } from '@/routes';

export default function GroupsEmptyState() {
    return (
        <section className="rounded-2xl border border-border bg-gradient-to-b from-card to-card/60 p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-xl bg-accent text-primary">
                <TableProperties size={24} />
            </div>
            <h2 className="text-2xl font-bold text-foreground">
                No standings available
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                Group standings will appear here after standings data has been
                synchronized.
            </p>
            <Link
                href={matches()}
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-secondary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
            >
                View matches
                <ArrowRight className="h-4 w-4" />
            </Link>
        </section>
    );
}
