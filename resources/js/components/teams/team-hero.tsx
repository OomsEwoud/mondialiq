import type { TeamDetails } from '@/types/team-details';

interface Props {
    team: TeamDetails;
}

export default function TeamHero({ team }: Props) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <img
                        src={team.logo}
                        alt={team.name}
                        className="h-20 w-20 object-contain"
                    />
                    <div>
                        <p className="text-xs font-black tracking-widest text-cyan-500 uppercase">
                            National team
                        </p>
                        <h1 className="text-3xl font-black tracking-tight text-blue-950">
                            {team.name}
                        </h1>
                        <p className="mt-1 text-sm font-bold text-slate-400">
                            {team.code ?? 'No code'}
                        </p>
                    </div>
                </div>

                {team.country?.flag && (
                    <img
                        src={team.country.flag}
                        alt={team.country.name}
                        className="h-12 w-16 rounded-md object-cover shadow-sm"
                    />
                )}
            </div>
        </section>
    );
}
