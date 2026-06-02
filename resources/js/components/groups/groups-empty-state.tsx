import { TableProperties } from 'lucide-react';

const emptyStateClassName =
    'rounded-[1.75rem] border border-dashed border-cyan-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(240,249,255,0.88))] p-12 text-center shadow-lg shadow-cyan-950/5';

export default function GroupsEmptyState() {
    return (
        <section className={emptyStateClassName}>
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-white text-cyan-700 shadow-sm shadow-cyan-950/5 ring-1 ring-cyan-100">
                <TableProperties size={24} />
            </div>
            <h2 className="text-2xl font-black text-blue-950">
                No standings available
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
                Group standings will appear here after the standings sync has
                stored World Cup data.
            </p>
        </section>
    );
}
