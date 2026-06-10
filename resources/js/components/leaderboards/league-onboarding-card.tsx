import { Link } from '@inertiajs/react';
import { ArrowRight, Share2, Target, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/forms/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/layout/card';
import { cn } from '@/lib/utils';
import { matches, predictions } from '@/routes';
import type { LeagueAccentColor } from '@/types/league';
import { getLeagueThemePalette } from '@/utils/league-branding';

type Props = {
    leagueName: string;
    membersCount: number;
    currentUserPoints: number;
    accentColor: LeagueAccentColor;
};

export default function LeagueOnboardingCard({
    leagueName,
    membersCount,
    currentUserPoints,
    accentColor,
}: Props) {
    const isNewLeague = membersCount <= 3;
    const needsFirstPrediction = currentUserPoints === 0;
    const description = isNewLeague
        ? `${leagueName} is still a fresh group. A few quick steps will make it feel competitive much faster.`
        : 'You are in the group. Now turn it into an active race.';
    const theme = getLeagueThemePalette(accentColor);

    if (!isNewLeague && !needsFirstPrediction) {
        return null;
    }

    const openInviteTools = () => {
        document
            .getElementById('league-invite')
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <Card
            className={cn(
                'gap-0 rounded-2xl border py-0 shadow-sm',
                theme.softBorder,
                theme.softBg,
            )}
        >
            <CardHeader className="gap-2 px-4 py-4 sm:px-6">
                <CardTitle className="text-xl font-bold text-slate-900 sm:text-2xl">
                    What next?
                </CardTitle>
                <CardDescription className="text-sm leading-6 text-slate-600">
                    {description}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 px-4 pb-4 sm:px-6">
                <div className="rounded-2xl border border-white/80 bg-white/85 px-4 py-3">
                    <div
                        className={cn(
                            'flex items-center gap-2',
                            theme.softText,
                        )}
                    >
                        <Share2 className="size-4" />
                        <p className="text-xs font-bold tracking-wide uppercase">
                            Step 1
                        </p>
                    </div>
                    <p className="mt-2 text-sm font-bold text-slate-900">
                        Invite more friends into the group.
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                        Bigger groups create more movement, more tension, and a
                        better leaderboard every matchday.
                    </p>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={openInviteTools}
                        className={cn(
                            'mt-3 h-10 w-full rounded-xl border-slate-200 bg-white px-4 font-bold text-slate-900 hover:bg-slate-50 sm:w-auto',
                            theme.buttonRing,
                        )}
                    >
                        Open invite tools
                        <ArrowRight className="size-4" />
                    </Button>
                </div>

                <div className="rounded-2xl border border-white/80 bg-white/85 px-4 py-3">
                    <div
                        className={cn(
                            'flex items-center gap-2',
                            theme.softText,
                        )}
                    >
                        <Target className="size-4" />
                        <p className="text-xs font-bold tracking-wide uppercase">
                            Step 2
                        </p>
                    </div>
                    <p className="mt-2 text-sm font-bold text-slate-900">
                        Make your next prediction.
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                        Fresh picks are the fastest way to climb once this group
                        starts filling up.
                    </p>
                    <Button
                        asChild
                        className={cn(
                            'mt-3 h-10 w-full rounded-xl px-4 font-bold text-white sm:w-auto',
                            theme.primaryButton,
                            theme.buttonRing,
                        )}
                    >
                        <Link href={matches.url()}>
                            Explore matches
                            <ArrowRight className="size-4" />
                        </Link>
                    </Button>
                </div>

                <div className="rounded-2xl border border-white/80 bg-white/85 px-4 py-3">
                    <div
                        className={cn(
                            'flex items-center gap-2',
                            theme.softText,
                        )}
                    >
                        <Trophy className="size-4" />
                        <p className="text-xs font-bold tracking-wide uppercase">
                            Step 3
                        </p>
                    </div>
                    <p className="mt-2 text-sm font-bold text-slate-900">
                        Track how your picks stack up.
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                        Keep your prediction history close so you can spot
                        momentum early.
                    </p>
                    <Button
                        asChild
                        variant="outline"
                        className={cn(
                            'mt-3 h-10 w-full rounded-xl border-slate-200 bg-white px-4 font-bold text-slate-900 hover:bg-slate-50 sm:w-auto',
                            theme.buttonRing,
                        )}
                    >
                        <Link href={predictions.url()}>
                            Open my predictions
                            <ArrowRight className="size-4" />
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
