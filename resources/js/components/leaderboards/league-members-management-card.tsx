import { Form } from '@inertiajs/react';
import { Plus, ShieldCheck, Users } from 'lucide-react';
import AddAiParticipantController from '@/actions/App/Http/Controllers/Leagues/AddAiParticipantController';
import { Badge } from '@/components/ui/feedback/badge';
import { Spinner } from '@/components/ui/feedback/spinner';
import { Button } from '@/components/ui/forms/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/layout/card';
import type { LeagueMember } from '@/types/league';
import LeagueMemberManagementItem from './league-member-management-item';

type Props = {
    leagueId: number;
    members: LeagueMember[];
};

export default function LeagueMembersManagementCard({
    leagueId,
    members,
}: Props) {
    const showOnlyOwnerState = members.length <= 1;
    const hasAiParticipant = members.some((m) => m.isSystemUser);

    return (
        <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardHeader className="gap-3 px-4 py-5 sm:px-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-cyan-600">
                            <ShieldCheck className="size-4" />
                            <p className="text-xs font-bold tracking-wide uppercase">
                                Member management
                            </p>
                        </div>
                        <CardTitle className="mt-2 text-2xl font-bold text-slate-900">
                            Team access
                        </CardTitle>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {!hasAiParticipant && (
                            <Form
                                {...AddAiParticipantController.form({
                                    scoreboard: leagueId,
                                })}
                                options={{ preserveScroll: true }}
                            >
                                {({ processing }) => (
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        variant="outline"
                                        className="rounded-full border-cyan-200 bg-cyan-50 px-3 py-1 font-bold text-cyan-700 hover:bg-cyan-100"
                                    >
                                        {processing && <Spinner />}
                                        <Plus className="size-3.5" />
                                        Add AI participant
                                    </Button>
                                )}
                            </Form>
                        )}
                        <Badge
                            variant="outline"
                            className="w-fit rounded-full border-slate-200 bg-slate-50 px-3 py-1 font-bold text-slate-700"
                        >
                            <Users className="size-3.5 text-cyan-600" />
                            {members.length}{' '}
                            {members.length === 1 ? 'member' : 'members'}
                        </Badge>
                    </div>
                </div>
                <CardDescription className="text-sm leading-6 text-slate-500">
                    Review members, transfer ownership, or remove access when a
                    group invite is no longer meant for someone.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 px-4 pb-5 sm:px-6">
                {showOnlyOwnerState && (
                    <div className="rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3">
                        <div className="flex gap-3">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-cyan-600 shadow-sm">
                                <Users className="size-4" />
                            </span>
                            <div>
                                <p className="text-sm font-bold text-cyan-950">
                                    Invite friends to fill this group.
                                </p>
                                <p className="mt-1 text-sm leading-6 text-cyan-900">
                                    Once more members join, ownership transfer
                                    and removal controls will appear here.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {members.map((member) => (
                    <LeagueMemberManagementItem
                        key={member.id}
                        member={member}
                        leagueId={leagueId}
                    />
                ))}
            </CardContent>
        </Card>
    );
}
