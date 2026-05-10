import TeamCodeBadge from '@/components/groups/team-code-badge';
import type { GroupTeam } from '@/types/group';

interface Props {
    teams: GroupTeam[];
}

export default function QualificationProbability({ teams }: Props) {
    return (
        <section className="mt-6 sm:mt-8">
            <h3 className="mb-4 text-base font-black text-blue-950 sm:text-lg">
                Qualification Probability
            </h3>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 sm:p-4">
                <div className="grid gap-4 sm:gap-5">
                    {teams.map((team) => (
                        <div
                            key={team.id}
                            className="grid gap-2 sm:gap-3 md:grid-cols-[12rem_1fr]"
                        >
                            <div className="flex items-center justify-between gap-3 md:justify-start">
                                <TeamCodeBadge
                                    code={team.code}
                                    logo={team.logo}
                                />
                                <span className="truncate text-sm font-black text-blue-950">
                                    {team.name}
                                </span>
                            </div>
                            <div className="relative h-9 overflow-hidden rounded-full border border-emerald-200 bg-white shadow-inner sm:h-10">
                                <div
                                    className="flex h-full min-w-10 items-center justify-end rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 pr-3 text-xs font-black text-white transition-all sm:pr-4 sm:text-sm"
                                    style={{
                                        width: `${team.qualificationProbability}%`,
                                    }}
                                >
                                    {team.qualificationProbability}%
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
