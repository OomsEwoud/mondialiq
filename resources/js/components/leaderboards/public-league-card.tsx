import { router } from '@inertiajs/react';
import { LogIn, Users } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/feedback/badge';
import { Button } from '@/components/ui/forms/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/layout/card';
import { cn } from '@/lib/utils';
import { joinPublic } from '@/routes/leagues';

import type { PublicLeague } from '@/types/league';

import {
    getLeagueThemeBannerClass,
    getLeagueThemePalette,
} from '@/utils/league-branding';

type Props = {
    league: PublicLeague;
    isAtLimit: boolean;
};

export default function PublicLeagueCard({ league, isAtLimit }: Props) {
    const [isJoining, setIsJoining] = useState(false);
    const theme = getLeagueThemePalette(league.accent_color);
    const memberLabel = league.users_count === 1 ? 'member' : 'members';

    const joinLeague = () => {
        setIsJoining(true);
        router.post(
            joinPublic.url({ scoreboard: league.id }),
            {},
            {
                onFinish: () => setIsJoining(false),
            },
        );
    };

    return (
        <Card className="flex h-full flex-col overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
            <div className={getLeagueThemeBannerClass(league.accent_color)}>
                <div className="flex items-center gap-3 px-4 py-4 sm:px-5">
                    <div
                        className={cn(
                            'flex size-12 shrink-0 items-center justify-center rounded-2xl border bg-white/15 text-2xl shadow-sm ring-1',
                            theme.badgeBorder,
                        )}
                    >
                        <span aria-hidden="true">{league.icon}</span>
                    </div>
                    <div className="min-w-0">
                        <p
                            className={cn(
                                'truncate text-xs font-bold tracking-wide uppercase',
                                theme.accentText,
                            )}
                        >
                            Open group
                        </p>
                        <p className="truncate text-lg font-bold text-white">
                            {league.name}
                        </p>
                    </div>
                </div>
            </div>

            <CardHeader className="gap-2 px-4 py-4 sm:px-5">
                <CardTitle className="line-clamp-1 text-lg font-bold text-slate-900">
                    {league.name}
                </CardTitle>
                <CardDescription className="line-clamp-2 text-sm text-slate-500">
                    {league.description || 'No description provided.'}
                </CardDescription>
            </CardHeader>

            <CardContent className="mt-auto px-4 pb-5 sm:px-5">
                <div className="mb-4 flex items-center justify-between">
                    <Badge
                        variant="secondary"
                        className="rounded-full px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm"
                    >
                        <Users className="mr-1.5 size-3.5" />
                        {league.users_count} {memberLabel}
                    </Badge>
                </div>

                <Button
                    onClick={joinLeague}
                    disabled={isJoining || isAtLimit}
                    className="h-10 w-full rounded-lg font-semibold"
                >
                    <LogIn className="mr-2 size-4" />
                    {isJoining ? 'Joining...' : 'Join group'}
                </Button>
            </CardContent>
        </Card>
    );
}
