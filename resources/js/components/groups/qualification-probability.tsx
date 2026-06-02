import TeamStandingLink from '@/components/groups/team-standing-link';
import type { GroupTeam } from '@/types/group';

interface Props {
    teams: GroupTeam[];
}

export default function QualificationProbability({ teams }: Props) {
    return (
        <section className="mt-6 rounded-[1.7rem] border border-emerald-200/60 bg-[radial-gradient(circle_at_top_right,rgba(52,211,153,0.12),transparent_20rem),linear-gradient(180deg,rgba(248,255,252,0.98),rgba(236,253,245,0.82))] p-4 shadow-xl shadow-emerald-950/6 sm:mt-8 sm:p-6">
            <header className="mb-4">
                <p className="text-xs font-black tracking-[0.18em] text-emerald-700 uppercase">
                    Model outlook
                </p>
                <h3 className="text-xl font-black text-slate-950 sm:text-2xl">
                    Qualification Probability
                </h3>
            </header>
            <div className="grid gap-3 sm:gap-4">
                {teams.map((team) => (
                    <div
                        key={team.id}
                        className="grid gap-3 rounded-2xl border border-white/70 bg-white/55 px-3 py-3 shadow-sm shadow-emerald-950/5 backdrop-blur md:grid-cols-[14rem_1fr] md:items-center md:px-4"
                    >
                        <div className="min-w-0">
                            <TeamStandingLink
                                id={team.id}
                                code={team.code}
                                logo={team.logo}
                                name={team.name}
                            />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center justify-between text-xs font-black text-slate-500">
                                <span>Chance to advance</span>
                                <span className="text-sm text-slate-900">
                                    {team.qualificationProbability}%
                                </span>
                            </div>
                            <div className="h-3.5 overflow-hidden rounded-full bg-slate-100">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 shadow-sm shadow-emerald-950/10 transition-all"
                                    style={{
                                        width: `${team.qualificationProbability}%`,
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
