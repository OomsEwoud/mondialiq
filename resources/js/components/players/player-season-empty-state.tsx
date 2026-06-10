import { Activity } from 'lucide-react';

export default function PlayerSeasonEmptyState() {
    return (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-10 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Activity className="size-7" />
            </span>
            <div>
                <p className="text-base font-bold text-slate-700">
                    No World Cup 2026 statistics available yet for this player.
                </p>
                <p className="mt-1 text-sm text-slate-500">
                    Statistics will appear once the player has recorded match
                    data for the World Cup 2026 tournament.
                </p>
            </div>
        </div>
    );
}
