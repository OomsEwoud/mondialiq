import { Crown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/display/avatar';
import { Badge } from '@/components/ui/feedback/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/layout/card';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import type { LeagueMember } from '@/types/league';

type Props = {
    members: LeagueMember[];
};

const topRankStyles: Record<number, string> = {
    1: 'border-amber-200 bg-amber-50 text-amber-700',
    2: 'border-slate-300 bg-slate-100 text-slate-700',
    3: 'border-orange-200 bg-orange-50 text-orange-700',
};

const formToneStyles: Record<LeagueMember['form']['tone'], string> = {
    hot: 'bg-emerald-100 text-emerald-800',
    steady: 'bg-cyan-100 text-cyan-800',
    chasing: 'bg-amber-100 text-amber-800',
    cold: 'bg-rose-100 text-rose-800',
    neutral: 'bg-slate-100 text-slate-700',
};

export default function LeagueMembersCard({ members }: Props) {
    const getInitials = useInitials();

    return (
        <Card className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardHeader className="gap-2 border-b border-slate-200 px-4 py-5 sm:px-6">
                <CardTitle className="text-2xl font-black text-blue-950">
                    League Rankings
                </CardTitle>
                <CardDescription className="text-sm leading-6 text-slate-500">
                    Live standings inside this private league.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-slate-200">
                    {members.map((member) => (
                        <div
                            key={member.id}
                            className={cn(
                                'grid grid-cols-[auto_minmax(0,1fr)_auto] gap-3 px-4 py-4 sm:px-6',
                                member.isCurrentUser &&
                                    'bg-cyan-50/70 ring-1 ring-inset ring-cyan-100',
                            )}
                        >
                            <div
                                className={cn(
                                    'mt-1 flex min-w-11 items-center justify-center rounded-full border px-3 py-2 text-sm font-black',
                                    topRankStyles[member.rank] ??
                                        'border-slate-200 bg-slate-50 text-blue-950',
                                )}
                            >
                                #{member.rank}
                            </div>

                            <div className="flex min-w-0 items-center gap-3">
                                <Avatar className="size-11 rounded-2xl ring-1 ring-slate-200">
                                    <AvatarImage
                                        src={member.avatar ?? undefined}
                                        alt={member.name}
                                        className="object-cover"
                                    />
                                    <AvatarFallback className="bg-blue-950 text-xs font-black text-white">
                                        {getInitials(member.name)}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="truncate text-sm font-black text-blue-950 sm:text-base">
                                            {member.name}
                                        </p>
                                        {member.isOwner && (
                                            <Badge className="rounded-full bg-amber-400 px-2 py-0.5 text-[11px] font-black text-amber-950">
                                                <Crown className="size-3" />
                                                Host
                                            </Badge>
                                        )}
                                        {member.isCurrentUser && (
                                            <Badge className="rounded-full bg-cyan-500 px-2 py-0.5 text-[11px] font-black text-blue-950">
                                                You
                                            </Badge>
                                        )}
                                        <Badge
                                            className={cn(
                                                'rounded-full px-2 py-0.5 text-[11px] font-black',
                                                formToneStyles[member.form.tone],
                                            )}
                                        >
                                            {member.form.label}
                                        </Badge>
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        <StatPill
                                            label={
                                                member.gapToAbove === null
                                                    ? 'Leading'
                                                    : `${member.gapToAbove} pts to above`
                                            }
                                        />
                                        <StatPill
                                            label={`${member.scoringPredictionsCount} scored picks`}
                                        />
                                        <StatPill
                                            label={
                                                member.lastPredictionLabel
                                                    ? `Last pick ${member.lastPredictionLabel}`
                                                    : 'No picks yet'
                                            }
                                        />
                                    </div>
                                    <p className="mt-2 text-xs text-slate-500 sm:text-sm">
                                        {member.predictionsCount}{' '}
                                        {member.predictionsCount === 1
                                            ? 'prediction'
                                            : 'predictions'}
                                    </p>
                                </div>
                            </div>

                            <div className="text-right">
                                <p className="text-xl font-black text-cyan-600 sm:text-2xl">
                                    {member.totalPoints}
                                </p>
                                <p className="text-[11px] font-black tracking-[0.18em] text-slate-500 uppercase">
                                    pts
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

type StatPillProps = {
    label: string;
};

function StatPill({ label }: StatPillProps) {
    return (
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
            {label}
        </span>
    );
}
