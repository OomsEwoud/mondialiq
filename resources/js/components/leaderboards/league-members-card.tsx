import { Link } from '@inertiajs/react';
import { Bot, Crown, Eye, Users } from 'lucide-react';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/components/ui/display/avatar';
import { Badge } from '@/components/ui/feedback/badge';
import { Button } from '@/components/ui/forms/button';
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
import StatPill from './stat-pill';

type Props = {
    members: LeagueMember[];
};

const topRankStyles: Record<number, string> = {
    1: 'border-amber-200 bg-amber-50 text-amber-700',
    2: 'border-slate-300 bg-slate-100 text-slate-700',
    3: 'border-cyan-200 bg-cyan-50 text-cyan-600',
};

type FormTone = 'hot' | 'steady' | 'chasing' | 'cold' | 'neutral';

const formToneStyles: Record<FormTone, string> = {
    hot: 'bg-emerald-100 text-emerald-800',
    steady: 'bg-cyan-100 text-cyan-700',
    chasing: 'bg-amber-100 text-amber-800',
    cold: 'bg-rose-100 text-rose-800',
    neutral: 'bg-slate-100 text-slate-700',
};

export default function LeagueMembersCard({ members }: Props) {
    const getInitials = useInitials();
    const memberLabel = members.length === 1 ? 'member' : 'members';
    const hasLowActivity =
        members.length <= 1 ||
        members.every((member) => member.predictionsCount === 0);

    return (
        <Card className="gap-0 overflow-hidden rounded-2xl border-slate-200 bg-white py-0 shadow-sm">
            <CardHeader className="gap-3 border-b border-slate-200 px-4 py-4 sm:px-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <CardTitle className="text-xl font-bold text-slate-900 sm:text-2xl">
                            Group rankings
                        </CardTitle>
                        <CardDescription className="mt-1 text-sm leading-6 text-slate-500">
                            Member-only standings in this prediction group.
                        </CardDescription>
                    </div>
                    <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">
                        <Users className="size-3.5 text-slate-600" />
                        {members.length} {memberLabel}
                    </span>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-slate-200">
                    {members.map((member) => (
                        <div
                            key={member.id}
                            className={cn(
                                'grid grid-cols-[auto_minmax(0,1fr)_auto] gap-3 border-l-4 border-transparent px-4 py-3.5 sm:px-6',
                                member.isCurrentUser &&
                                    'border-cyan-200 bg-cyan-50/50 ring-1 ring-slate-200',
                            )}
                        >
                            <div
                                className={cn(
                                    'mt-1 flex min-w-11 items-center justify-center rounded-full border px-3 py-2 text-sm font-bold shadow-xs',
                                    topRankStyles[member.rank] ??
                                        'border-slate-200 bg-slate-50 text-slate-900',
                                )}
                            >
                                #{member.rank}
                            </div>

                            <div className="flex min-w-0 items-center gap-3">
                                <Avatar className="size-10 rounded-2xl ring-1 ring-slate-200 sm:size-11">
                                    <AvatarImage
                                        src={member.avatar ?? undefined}
                                        alt={member.name}
                                        className="object-cover"
                                    />
                                    <AvatarFallback className="bg-slate-800 text-xs font-semibold text-slate-200">
                                        {getInitials(member.name)}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="truncate text-sm font-bold text-slate-900 sm:text-base">
                                            {member.name}
                                        </p>
                                        {member.isOwner && (
                                            <Badge className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700 shadow-none">
                                                <Crown className="size-3" />
                                                Host
                                            </Badge>
                                        )}
                                        {member.isSystemUser && (
                                            <Badge className="rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-bold text-white shadow-none">
                                                <Bot className="size-3" />
                                                AI
                                            </Badge>
                                        )}
                                        {member.isCurrentUser && (
                                            <Badge className="rounded-full border border-cyan-200 bg-white px-2 py-0.5 text-xs font-bold text-cyan-600 shadow-none">
                                                You
                                            </Badge>
                                        )}
                                        {member.form && (
                                            <Badge
                                                className={cn(
                                                    'rounded-full px-2 py-0.5 text-xs font-bold',
                                                    formToneStyles[
                                                        member.form.tone
                                                    ],
                                                )}
                                            >
                                                {member.form.label}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        <StatPill
                                            label={
                                                member.gapToAbove === null ||
                                                member.gapToAbove === undefined
                                                    ? 'Leading'
                                                    : `${member.gapToAbove} pts to above`
                                            }
                                        />
                                        <StatPill
                                            label={`${member.scoringPredictionsCount} validated picks`}
                                        />
                                        <StatPill
                                            label={`${member.perfectPredictionsCount} perfect scores`}
                                        />
                                        <StatPill
                                            label={
                                                member.lastPredictionLabel
                                                    ? `Last pick ${member.lastPredictionLabel}`
                                                    : 'No picks yet'
                                            }
                                        />
                                    </div>
                                    <p className="mt-2 text-xs font-medium text-slate-500 sm:text-sm">
                                        {member.predictionsCount}{' '}
                                        {member.predictionsCount === 1
                                            ? 'prediction'
                                            : 'predictions'}
                                    </p>
                                </div>
                            </div>

                            <div className="text-right">
                                <p className="text-2xl leading-none font-bold text-slate-900 sm:text-3xl">
                                    {member.totalPoints}
                                </p>
                                <p className="text-xs font-bold tracking-wide text-slate-500 uppercase">
                                    PTS
                                </p>
                                {member.predictionsHref && (
                                    <Button
                                        asChild
                                        variant="ghost"
                                        size="sm"
                                        className="mt-2 h-auto px-0 py-0 text-xs font-semibold text-cyan-600 hover:bg-transparent hover:text-cyan-700"
                                    >
                                        <Link href={member.predictionsHref}>
                                            <Eye className="mr-1 size-3.5" />
                                            See predictions
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                {hasLowActivity && (
                    <div className="border-t border-slate-200 bg-cyan-50/40 px-4 py-3 sm:px-6">
                        <div className="flex gap-3">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600">
                                <Users className="size-4" />
                            </span>
                            <div>
                                <p className="text-sm leading-6 font-semibold text-slate-900">
                                    Invite friends to fill the leaderboard. Once
                                    members make predictions, the race will
                                    appear here.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
