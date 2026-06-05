import { Form } from '@inertiajs/react';
import { Crown, ShieldCheck, ShieldPlus, UserMinus, Users } from 'lucide-react';
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

    return (
        <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardHeader className="gap-3 px-4 py-5 sm:px-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-cyan-700">
                            <ShieldCheck className="size-4" />
                            <p className="text-xs font-black tracking-[0.16em] uppercase">
                                Member management
                            </p>
                        </div>
                        <CardTitle className="mt-2 text-2xl font-black text-blue-950">
                            Team access
                        </CardTitle>
                    </div>

                    <Badge
                        variant="outline"
                        className="w-fit rounded-full border-slate-200 bg-slate-50 px-3 py-1 font-black text-slate-700"
                    >
                        <Users className="size-3.5 text-cyan-700" />
                        {members.length}{' '}
                        {members.length === 1 ? 'member' : 'members'}
                    </Badge>
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
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-cyan-700 shadow-sm">
                                <Users className="size-4" />
                            </span>
                            <div>
                                <p className="text-sm font-black text-cyan-950">
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
                                            Owner
                                        </Badge>
                                    )}
                                    {member.isCurrentUser && (
                                        <Badge className="rounded-full bg-cyan-500 px-2 py-0.5 text-[11px] font-black text-blue-950">
                                            You
                                        </Badge>
                                    )}
                                </div>
                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                    {member.canBeManaged
                                        ? 'Can be transferred or removed.'
                                        : 'Protected owner access.'}
                                </p>
                            </div>
                        </div>

                        <div className="w-full shrink-0 sm:w-auto">
                            {member.canBeManaged ? (
                                <div className="grid gap-2 sm:min-w-52">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="h-10 w-full rounded-xl border-cyan-200 bg-white px-4 font-black text-cyan-900 hover:border-cyan-300 hover:bg-cyan-50 focus-visible:ring-cyan-300"
                                            >
                                                <ShieldPlus className="size-4" />
                                                Make owner
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="border-slate-200 bg-white sm:max-w-md">
                                            <DialogTitle className="text-blue-950">
                                                Transfer ownership to{' '}
                                                {member.name}?
                                            </DialogTitle>
                                            <DialogDescription className="text-sm leading-6 text-slate-600">
                                                {member.name} will become the
                                                new group owner immediately. You
                                                will stay in the group as a
                                                member, but owner controls move
                                                to them.
                                            </DialogDescription>
                                            <div className="rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm leading-6 text-cyan-900">
                                                After this transfer, use the
                                                regular group page as a normal
                                                member. Only the new owner will
                                                keep access to this settings
                                                page.
                                            </div>

                                            <Form
                                                {...TransferLeagueOwnershipController.form(
                                                    {
                                                        scoreboard: leagueId,
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
                                                        <DialogClose asChild>
                                                            <Button
                                                                type="button"
                                                                variant="secondary"
                                                                className="rounded-lg font-black"
                                                            >
                                                                Cancel
                                                            </Button>
                                                        </DialogClose>

                                                        <Button
                                                            type="submit"
                                                            disabled={
                                                                processing
                                                            }
                                                            className="rounded-lg font-black"
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

                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                className="h-10 w-full rounded-xl bg-red-600 px-4 font-black hover:bg-red-700 focus-visible:ring-red-200"
                                            >
                                                <UserMinus className="size-4" />
                                                Remove member
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="border-slate-200 bg-white sm:max-w-md">
                                            <DialogTitle className="text-blue-950">
                                                Remove {member.name} from this
                                                group?
                                            </DialogTitle>
                                            <DialogDescription className="text-sm leading-6 text-slate-600">
                                                This removes their access to the
                                                group immediately. Existing
                                                predictions stay recorded, but
                                                they will no longer appear as an
                                                active member.
                                            </DialogDescription>

                                            <Form
                                                {...RemoveLeagueMemberController.form(
                                                    {
                                                        scoreboard: leagueId,
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
                                                        <DialogClose asChild>
                                                            <Button
                                                                type="button"
                                                                variant="secondary"
                                                                className="rounded-lg font-black"
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
                                                            className="rounded-lg font-black"
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
                                </div>
                            ) : (
                                <Badge className="rounded-full bg-amber-100 px-2.5 py-1 font-black text-amber-900">
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
