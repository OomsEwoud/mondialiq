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
import { matches, predictions } from '@/routes';

type Props = {
    leagueName: string;
    membersCount: number;
    currentUserPoints: number;
};

export default function LeagueOnboardingCard({
    leagueName,
    membersCount,
    currentUserPoints,
}: Props) {
    const isNewLeague = membersCount <= 3;
    const needsFirstPrediction = currentUserPoints === 0;

    if (!isNewLeague && !needsFirstPrediction) {
        return null;
    }

    return (
        <Card className="rounded-2xl border-cyan-200 bg-linear-to-br from-cyan-50 via-white to-blue-50 shadow-sm">
            <CardHeader className="gap-2 px-4 py-5 sm:px-6">
                <CardTitle className="text-2xl font-black text-blue-950">
                    What next?
                </CardTitle>
                <CardDescription className="text-sm leading-6 text-slate-600">
                    {isNewLeague
                        ? `${leagueName} is still a fresh league. A few quick steps will make it feel competitive much faster.`
                        : 'You are in the league. Now turn it into an active race.'}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 px-4 pb-5 sm:px-6">
                <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-4">
                    <div className="flex items-center gap-2 text-cyan-700">
                        <Share2 className="size-4" />
                        <p className="text-xs font-black tracking-[0.16em] uppercase">
                            Step 1
                        </p>
                    </div>
                    <p className="mt-2 text-sm font-black text-blue-950">
                        Invite more friends into the league.
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                        Bigger leagues create more movement, more tension, and a
                        better leaderboard every matchday.
                    </p>
                    <Button
                        asChild
                        variant="outline"
                        className="mt-3 h-10 rounded-lg border-cyan-200 bg-white px-4 font-black text-cyan-900 hover:bg-cyan-50"
                    >
                        <a href="#league-invite">
                            Open invite tools
                            <ArrowRight className="size-4" />
                        </a>
                    </Button>
                </div>

                <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-4">
                    <div className="flex items-center gap-2 text-cyan-700">
                        <Target className="size-4" />
                        <p className="text-xs font-black tracking-[0.16em] uppercase">
                            Step 2
                        </p>
                    </div>
                    <p className="mt-2 text-sm font-black text-blue-950">
                        Make your next prediction.
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                        Fresh picks are the fastest way to climb once this
                        league starts filling up.
                    </p>
                    <Button
                        asChild
                        className="mt-3 h-10 rounded-lg px-4 font-black"
                    >
                        <Link href={matches.url()}>
                            Explore matches
                            <ArrowRight className="size-4" />
                        </Link>
                    </Button>
                </div>

                <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-4">
                    <div className="flex items-center gap-2 text-cyan-700">
                        <Trophy className="size-4" />
                        <p className="text-xs font-black tracking-[0.16em] uppercase">
                            Step 3
                        </p>
                    </div>
                    <p className="mt-2 text-sm font-black text-blue-950">
                        Track how your picks stack up.
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                        Keep your prediction history close so you can spot
                        momentum early.
                    </p>
                    <Button
                        asChild
                        variant="outline"
                        className="mt-3 h-10 rounded-lg px-4 font-black"
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
