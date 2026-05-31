import { TableProperties } from 'lucide-react';

const emptyStateClassName =
    'rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center';

export default function GroupsEmptyState() {
    return (
        <section className={emptyStateClassName}>
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                <TableProperties size={24} />
            </div>
            <h2 className="text-xl font-black text-blue-950">
                No standings available
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                Group standings will appear here after the standings sync has
                stored World Cup data.
            </p>
        </section>
    );
}
