import { Link } from '@inertiajs/react';
import { ArrowRight, TableProperties } from 'lucide-react';
import { matches } from '@/routes';

export default function GroupsEmptyState() {
    return (
        <section className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                <TableProperties size={24} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
                No standings available
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
                Group standings will appear here after the standings sync has
                stored World Cup data.
            </p>
            <Link
                href={matches()}
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
                View matches
                <ArrowRight className="h-4 w-4" />
            </Link>
        </section>
    );
}
