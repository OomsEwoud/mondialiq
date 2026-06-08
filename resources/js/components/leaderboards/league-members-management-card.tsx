import { Form } from '@inertiajs/react';
import {
    Bot,
    Crown,
    Plus,
    Shield,
    ShieldCheck,
    ShieldPlus,
    Trash2,
    UserMinus,
    Users,
} from 'lucide-react';
import AddAiParticipantController from '@/actions/App/Http/Controllers/Leagues/AddAiParticipantController';
import RemoveAiParticipantController from '@/actions/App/Http/Controllers/Leagues/RemoveAiParticipantController';
import RemoveLeagueMemberController from '@/actions/App/Http/Controllers/Leagues/RemoveLeagueMemberController';
import TransferLeagueOwnershipController from '@/actions/App/Http/Controllers/Leagues/TransferLeagueOwnershipController';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/components/ui/display/avatar';
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
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/overlays/dialog';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import type { LeagueMember } from '@/types/league';

type Props = {
    leagueId: number;
    members: LeagueMember[];
};

export default function LeagueMembersManagementCard({
    leagueId,
    members,
}: Props) {
    const getInitials = useInitials();
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
                    <div
                        key={member.id}
                        className={cn(
                            'flex flex-col gap-3 rounded-2xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between',
                            member.isOwner
                                ? 'border-amber-200 bg-amber-50/70'
                                : member.isSystemUser
                                  ? 'border-emerald-200 bg-emerald-50/70'
                                  : 'border-slate-200 bg-slate-50',
                        )}
                    >
                        <div className="flex min-w-0 items-center gap-3">
                            <Avatar className="size-11 rounded-2xl ring-1 ring-slate-200">
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
                                        <Badge className="rounded-full bg-amber-400 px-2 py-0.5 text-xs font-bold text-amber-950">
                                            <Crown className="size-3" />
                                            Owner
                                        </Badge>
                                    )}
                                    {member.isSystemUser && (
                                        <Badge className="rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-bold text-white">
                                            <Bot className="size-3" />
                                            AI
                                        </Badge>
                                    )}
                                    {!member.isOwner &&
                                        !member.isSystemUser &&
                                        member.role === 'admin' && (
                                            <Badge className="rounded-full bg-violet-400 px-2 py-0.5 text-xs font-bold text-violet-950">
                                                <Shield className="size-3" />
                                                Admin
                                            </Badge>
                                        )}
                                    {!member.isOwner &&
                                        !member.isSystemUser &&
                                        member.role !== 'admin' && (
                                            <Badge
                                                variant="outline"
                                                className="rounded-full border-slate-200 bg-white px-2 py-0.5 text-xs font-bold text-slate-600"
                                            >
                                                Member
                                            </Badge>
                                        )}
                                    {member.isCurrentUser && (
                                        <Badge className="rounded-full bg-cyan-500 px-2 py-0.5 text-xs font-bold text-slate-900">
                                            You
                                        </Badge>
                                    )}
                                </div>
                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                    {member.isSystemUser
                                        ? 'Automated predictions participant.'
                                        : member.joinedAt
                                          ? `Joined ${new Date(member.joinedAt).toLocaleDateString()}.`
                                          : member.canBeManaged
                                            ? 'Can be transferred or removed.'
                                            : 'Protected owner access.'}
                                </p>
                            </div>
                        </div>

                        <div className="w-full shrink-0 sm:w-auto">
                            {member.canBeManaged ? (
                                <div className="grid gap-2 sm:min-w-52">
                                    {!member.isSystemUser && (
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="h-10 w-full rounded-xl border-cyan-200 bg-white px-4 font-bold text-cyan-900 hover:border-cyan-300 hover:bg-cyan-50 focus-visible:ring-cyan-300"
                                                >
                                                    <ShieldPlus className="size-4" />
                                                    Make owner
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="border-slate-200 bg-white sm:max-w-md">
                                                <DialogTitle className="text-slate-900">
                                                    Transfer ownership to{' '}
                                                    {member.name}?
                                                </DialogTitle>
                                                <DialogDescription className="text-sm leading-6 text-slate-600">
                                                    {member.name} will become
                                                    the new group owner
                                                    immediately. You will stay
                                                    in the group as a member,
                                                    but owner controls move to
                                                    them.
                                                </DialogDescription>
                                                <div className="rounded-2xl border border-slate-200 bg-cyan-50 px-4 py-3 text-sm leading-6 text-cyan-900">
                                                    After this transfer, use the
                                                    regular group page as a
                                                    normal member. Only the new
                                                    owner will keep access to
                                                    this settings page.
                                                </div>

                                                <Form
                                                    {...TransferLeagueOwnershipController.form(
                                                        {
                                                            scoreboard:
                                                                leagueId,
                                                            member: member.id,
                                                        },
                                                    )}
                                                    options={{
                                                        preserveScroll: true,
                                                    }}
                                                    className="space-y-4"
                                                >
                                                    {({ processing }) => (
                                                        <DialogFooter className="gap-2">
                                                            <DialogClose
                                                                asChild
                                                            >
                                                                <Button
                                                                    type="button"
                                                                    variant="secondary"
                                                                    className="rounded-lg font-bold"
                                                                >
                                                                    Cancel
                                                                </Button>
                                                            </DialogClose>

                                                            <Button
                                                                type="submit"
                                                                disabled={
                                                                    processing
                                                                }
                                                                className="rounded-lg font-bold"
                                                            >
                                                                {processing && (
                                                                    <Spinner />
                                                                )}
                                                                <ShieldPlus className="size-4" />
                                                                {processing
                                                                    ? 'Transferring...'
                                                                    : 'Confirm transfer'}
                                                            </Button>
                                                        </DialogFooter>
                                                    )}
                                                </Form>
                                            </DialogContent>
                                        </Dialog>
                                    )}

                                    {member.isSystemUser ? (
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    className="h-10 w-full rounded-xl bg-red-600 px-4 font-bold hover:bg-red-700 focus-visible:ring-red-200"
                                                >
                                                    <Trash2 className="size-4" />
                                                    Remove AI
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="border-slate-200 bg-white sm:max-w-md">
                                                <DialogTitle className="text-slate-900">
                                                    Remove AI participant from
                                                    this group?
                                                </DialogTitle>
                                                <DialogDescription className="text-sm leading-6 text-slate-600">
                                                    The AI participant will be
                                                    removed from the group
                                                    immediately. Existing AI
                                                    predictions stay recorded in
                                                    the leaderboard.
                                                </DialogDescription>

                                                <Form
                                                    {...RemoveAiParticipantController.form(
                                                        {
                                                            scoreboard:
                                                                leagueId,
                                                        },
                                                    )}
                                                    options={{
                                                        preserveScroll: true,
                                                    }}
                                                    className="space-y-4"
                                                >
                                                    {({ processing }) => (
                                                        <DialogFooter className="gap-2">
                                                            <DialogClose
                                                                asChild
                                                            >
                                                                <Button
                                                                    type="button"
                                                                    variant="secondary"
                                                                    className="rounded-lg font-bold"
                                                                >
                                                                    Cancel
                                                                </Button>
                                                            </DialogClose>

                                                            <Button
                                                                type="submit"
                                                                variant="destructive"
                                                                disabled={
                                                                    processing
                                                                }
                                                                className="rounded-lg font-bold"
                                                            >
                                                                {processing && (
                                                                    <Spinner />
                                                                )}
                                                                <Trash2 className="size-4" />
                                                                {processing
                                                                    ? 'Removing...'
                                                                    : 'Confirm remove'}
                                                            </Button>
                                                        </DialogFooter>
                                                    )}
                                                </Form>
                                            </DialogContent>
                                        </Dialog>
                                    ) : (
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    className="h-10 w-full rounded-xl bg-red-600 px-4 font-bold hover:bg-red-700 focus-visible:ring-red-200"
                                                >
                                                    <UserMinus className="size-4" />
                                                    Remove member
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="border-slate-200 bg-white sm:max-w-md">
                                                <DialogTitle className="text-slate-900">
                                                    Remove {member.name} from
                                                    this group?
                                                </DialogTitle>
                                                <DialogDescription className="text-sm leading-6 text-slate-600">
                                                    This removes their access to
                                                    the group immediately.
                                                    Existing predictions stay
                                                    recorded, but they will no
                                                    longer appear as an active
                                                    member.
                                                </DialogDescription>

                                                <Form
                                                    {...RemoveLeagueMemberController.form(
                                                        {
                                                            scoreboard:
                                                                leagueId,
                                                            member: member.id,
                                                        },
                                                    )}
                                                    options={{
                                                        preserveScroll: true,
                                                    }}
                                                    className="space-y-4"
                                                >
                                                    {({ processing }) => (
                                                        <DialogFooter className="gap-2">
                                                            <DialogClose
                                                                asChild
                                                            >
                                                                <Button
                                                                    type="button"
                                                                    variant="secondary"
                                                                    className="rounded-lg font-bold"
                                                                >
                                                                    Cancel
                                                                </Button>
                                                            </DialogClose>

                                                            <Button
                                                                type="submit"
                                                                variant="destructive"
                                                                disabled={
                                                                    processing
                                                                }
                                                                className="rounded-lg font-bold"
                                                            >
                                                                {processing && (
                                                                    <Spinner />
                                                                )}
                                                                <UserMinus className="size-4" />
                                                                {processing
                                                                    ? 'Removing...'
                                                                    : 'Confirm remove'}
                                                            </Button>
                                                        </DialogFooter>
                                                    )}
                                                </Form>
                                            </DialogContent>
                                        </Dialog>
                                    )}
                                </div>
                            ) : (
                                <Badge className="rounded-full bg-amber-100 px-2.5 py-1 font-bold text-amber-900">
                                    Protected role
                                </Badge>
                            )}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
