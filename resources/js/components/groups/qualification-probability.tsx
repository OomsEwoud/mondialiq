import TeamStandingLink from '@/components/groups/team-standing-link';
import type { GroupTeam } from '@/types/group';

interface Props {
    teams: GroupTeam[];
}

export default function QualificationProbability({ teams }: Props) {
    return (
        <section className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/30 p-4 shadow-sm shadow-blue-950/5 sm:mt-8 sm:p-5">
            <header className="mb-4">
                <p className="text-xs font-black tracking-widest text-emerald-700 uppercase">
                    Model outlook
                </p>
                <h3 className="text-base font-black text-slate-950 sm:text-lg">
                    Qualification Probability
                </h3>
            </header>
            <div className="grid gap-3 sm:gap-4">
                {teams.map((team) => (
                    <div
                        key={team.id}
                        className="grid gap-2 md:grid-cols-[14rem_1fr] md:items-center"
                    >
                        <div className="min-w-0">
                            <TeamStandingLink
                                id={team.id}
                                code={team.code}
                                logo={team.logo}
                                name={team.name}
                            />
                        </div>
                        <div className="grid gap-1.5">
                            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                                <span>Chance to advance</span>
                                <span className="text-slate-900">
                                    {team.qualificationProbability}%
                                </span>
                            </div>
                            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all"
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
