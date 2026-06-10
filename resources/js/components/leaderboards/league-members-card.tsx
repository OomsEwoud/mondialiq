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
import type { LeagueAccentColor, LeagueMember } from '@/types/league';
import { getLeagueThemePalette } from '@/utils/league-branding';
import StatPill from './stat-pill';

type Props = {
    members: LeagueMember[];
    accentColor: LeagueAccentColor;
};

export default function LeagueMembersCard({ members, accentColor }: Props) {
    const getInitials = useInitials();
    const theme = getLeagueThemePalette(accentColor);
    const memberLabel = members.length === 1 ? 'member' : 'members';
    const hasLowActivity =
        members.length <= 1 ||
        members.every((member) => member.predictionsCount === 0);

    return (
        <Card
            className={cn(
                'gap-0 overflow-hidden rounded-2xl border py-0 shadow-sm',
                theme.softBorder,
                'bg-white',
            )}
        >
            <CardHeader
                className={cn(
                    'gap-3 border-b px-4 py-4 sm:px-6',
                    theme.softBorder,
                )}
            >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <CardTitle
                            className={cn(
                                'text-xl font-bold sm:text-2xl',
                                theme.softText,
                            )}
                        >
                            Group rankings
                        </CardTitle>
                        <CardDescription className="mt-1 text-sm leading-6 text-slate-500">
                            Member-only standings in this prediction group.
                        </CardDescription>
                    </div>
                    <span
                        className={cn(
                            'inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold',
                            theme.softBorder,
                            theme.softBg,
                            theme.softText,
                        )}
                    >
                        <Users className="size-3.5" />
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
                                    cn(
                                        'ring-1 ring-slate-200',
                                        theme.currentUserHighlight,
                                    ),
                                member.isSystemUser && 'bg-slate-50/50',
                            )}
                        >
                            <div
                                className={cn(
                                    'mt-1 flex min-w-11 items-center justify-center rounded-full border px-3 py-2 text-sm font-bold',
                                    member.rank === 1
                                        ? theme.rankFirst
                                        : member.rank <= 3
                                          ? 'border-slate-300 bg-slate-100 text-slate-700'
                                          : 'border-slate-200 bg-slate-50 text-slate-900',
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
                                            <Badge
                                                className={cn(
                                                    'rounded-full px-2 py-0.5 text-xs font-bold shadow-none',
                                                    theme.softBorder,
                                                    theme.softBg,
                                                    theme.softText,
                                                )}
                                            >
                                                <Crown className="size-3" />
                                                Host
                                            </Badge>
                                        )}
                                        {member.isSystemUser && (
                                            <Badge className="rounded-full bg-slate-800 px-2 py-0.5 text-xs font-bold text-white shadow-none">
                                                <Bot className="size-3" />
                                                AI
                                            </Badge>
                                        )}
                                        {member.isCurrentUser && (
                                            <Badge
                                                className={cn(
                                                    'rounded-full bg-white px-2 py-0.5 text-xs font-bold shadow-none',
                                                    theme.softBorder,
                                                    theme.softText,
                                                )}
                                            >
                                                You
                                            </Badge>
                                        )}
                                        {member.form && (
                                            <Badge
                                                className={cn(
                                                    'rounded-full px-2 py-0.5 text-xs font-bold',
                                                    (member.form.tone ===
                                                        'hot' ||
                                                        member.form.tone ===
                                                            'chasing') &&
                                                        cn(
                                                            theme.softBg,
                                                            theme.softText,
                                                        ),
                                                    (member.form.tone ===
                                                        'steady' ||
                                                        member.form.tone ===
                                                            'cold' ||
                                                        member.form.tone ===
                                                            'neutral') &&
                                                        'bg-slate-100 text-slate-700',
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
                                            className={cn(
                                                theme.softBg,
                                                theme.softBorder,
                                                theme.softText,
                                            )}
                                        />
                                        <StatPill
                                            label={`${member.scoringPredictionsCount} validated`}
                                            className={cn(
                                                theme.softBg,
                                                theme.softBorder,
                                                theme.softText,
                                            )}
                                        />
                                        <StatPill
                                            label={`${member.perfectPredictionsCount} perfect`}
                                            className={cn(
                                                theme.softBg,
                                                theme.softBorder,
                                                theme.softText,
                                            )}
                                        />
                                    </div>
                                    <div className="mt-2 flex items-center gap-2 text-xs font-medium text-slate-500 sm:text-sm">
                                        <p>
                                            {member.predictionsCount}{' '}
                                            {member.predictionsCount === 1
                                                ? 'prediction'
                                                : 'predictions'}
                                        </p>
                                        {member.lastPredictionLabel && (
                                            <>
                                                <span>•</span>
                                                <p>Last {member.lastPredictionLabel}</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-end">
                                <div
                                    className={cn(
                                        'flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 sm:px-4',
                                        theme.softBg,
                                        theme.softBorder,
                                    )}
                                >
                                    <p className="text-xl leading-none font-bold text-slate-900 sm:text-2xl">
                                        {member.totalPoints}
                                    </p>
                                    <p className="mt-0.5 text-[10px] font-bold tracking-wide text-slate-500 uppercase">
                                        PTS
                                    </p>
                                </div>
                                {member.predictionsHref && (
                                    <Button
                                        asChild
                                        variant="ghost"
                                        size="sm"
                                        className={cn(
                                            'mt-2 h-auto px-0 py-0 text-xs font-semibold hover:bg-transparent',
                                            theme.link,
                                        )}
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
                    <div
                        className={cn(
                            'border-t px-4 py-5 sm:px-6',
                            theme.softBorder,
                            theme.softBg,
                        )}
                    >
                        <div className="flex flex-col items-center gap-3 text-center">
                            <span
                                className={cn(
                                    'flex size-10 items-center justify-center rounded-full',
                                    theme.inviteIcon,
                                )}
                            >
                                <Users className="size-5" />
                            </span>
                            <div>
                                <p
                                    className={cn(
                                        'text-sm font-bold',
                                        theme.softText,
                                    )}
                                >
                                    Your group is ready.
                                </p>
                                <p className="mt-1 text-sm leading-6 text-slate-600">
                                    Invite friends to start the race.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
