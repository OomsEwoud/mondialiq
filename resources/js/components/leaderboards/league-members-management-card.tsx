import { Form } from '@inertiajs/react';
import { Crown, ShieldCheck, ShieldPlus, UserMinus } from 'lucide-react';
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
import RemoveLeagueMemberController from '@/actions/App/Http/Controllers/Leagues/RemoveLeagueMemberController';
import TransferLeagueOwnershipController from '@/actions/App/Http/Controllers/Leagues/TransferLeagueOwnershipController';

type Props = {
    leagueId: number;
    members: LeagueMember[];
};

export default function LeagueMembersManagementCard({
    leagueId,
    members,
}: Props) {
    const getInitials = useInitials();
    const manageableMembers = members.filter((member) => member.canBeManaged);
    const manageableCount = manageableMembers.length;
    const showSingleManageableWarning = manageableCount === 1;

    return (
        <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardHeader className="gap-2 px-4 py-5 sm:px-6">
                <div className="flex items-center gap-2 text-cyan-700">
                    <ShieldCheck className="size-4" />
                    <p className="text-xs font-black tracking-[0.16em] uppercase">
                        Member management
                    </p>
                </div>
                <CardTitle className="text-2xl font-black text-blue-950">
                    Team access overview
                </CardTitle>
                <CardDescription className="text-sm leading-6 text-slate-500">
                    Owners are marked clearly, and removable members are
                    highlighted for a future management flow.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 px-4 pb-5 sm:px-6">
                {manageableCount === 0 && (
                {showEmptyManageableState && (
                    <div className="rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-4">
                        <p className="text-sm font-black text-cyan-900">
                            You are the only active manager in this league right
                            now.
                        </p>
                        <p className="mt-1 text-sm leading-6 text-cyan-800">
                            Invite another member before you transfer ownership
                            or start removing access.
                        </p>
                    </div>
                )}

                {showSingleManageableWarning && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
                        <p className="text-sm font-black text-amber-900">
                            Only one member can currently be managed.
                        </p>
                        <p className="mt-1 text-sm leading-6 text-amber-800">
                            Double-check ownership transfer or removal carefully
                            so the league does not become harder to manage
                            afterwards.
                        </p>
                    </div>
                )}

                {members.map((member) => (
                    <div
                        key={member.id}
                        className={cn(
                            'flex flex-col gap-4 rounded-2xl border px-4 py-4 sm:flex-row sm:items-center sm:justify-between',
                            member.isOwner
                                ? 'border-amber-200 bg-amber-50'
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
                                <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                                    {member.canBeManaged
                                        ? 'You can remove this member from the league if needed.'
                                        : 'Owner access cannot be removed from this screen later on.'}
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
                                                className="h-10 w-full rounded-lg border-cyan-200 bg-white px-4 font-black text-cyan-900 hover:bg-cyan-50"
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
                                                new league owner immediately.
                                                You will stay in the league as a
                                                member, but owner controls move
                                                to them.
                                            </DialogDescription>
                                            <div className="rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm leading-6 text-cyan-900">
                                                After this transfer, use the
                                                regular league page as a normal
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
                                                className="h-10 w-full rounded-lg px-4 font-black"
                                            >
                                                <UserMinus className="size-4" />
                                                Remove member
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="border-slate-200 bg-white sm:max-w-md">
                                            <DialogTitle className="text-blue-950">
                                                Remove {member.name} from this
                                                league?
                                            </DialogTitle>
                                            <DialogDescription className="text-sm leading-6 text-slate-600">
                                                This removes their access to the
                                                league immediately. Existing
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
