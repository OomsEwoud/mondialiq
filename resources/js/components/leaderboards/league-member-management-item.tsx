import { Form } from '@inertiajs/react';
import {
    Bot,
    Crown,
    Shield,
    ShieldPlus,
    Trash2,
    UserMinus,
} from 'lucide-react';
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
    member: LeagueMember;
    leagueId: number;
};

export default function LeagueMemberManagementItem({
    member,
    leagueId,
}: Props) {
    const getInitials = useInitials();

    return (
        <div
            className={cn(
                'flex flex-col gap-3 rounded-2xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between',
                member.isOwner
                    ? 'border-amber-200 bg-amber-50/70'
                    : member.isSystemUser
                      ? 'border-emerald-200 bg-emerald-50/70'
                      : 'border-border bg-muted',
            )}
        >
            <div className="flex min-w-0 items-center gap-3">
                <Avatar className="size-11 rounded-2xl ring-1 ring-border">
                    <AvatarImage
                        src={member.avatar ?? undefined}
                        alt={member.name}
                        className="object-cover"
                    />
                    <AvatarFallback className="bg-muted text-xs font-semibold text-foreground">
                        {getInitials(member.name)}
                    </AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-bold text-foreground sm:text-base">
                            {member.name}
                        </p>
                        {member.isOwner && (
                            <Badge className="rounded-full bg-amber-400 px-2 py-0.5 text-xs font-bold text-amber-950">
                                <Crown className="size-3" />
                                Owner
                            </Badge>
                        )}
                        {member.isSystemUser && (
                            <Badge className="rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-bold text-foreground">
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
                                    className="rounded-full border-border bg-card px-2 py-0.5 text-xs font-bold text-muted-foreground"
                                >
                                    Member
                                </Badge>
                            )}
                        {member.isCurrentUser && (
                            <Badge className="rounded-full bg-brand-subtle px-2 py-0.5 text-xs font-bold text-foreground">
                                You
                            </Badge>
                        )}
                    </div>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
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
                                        className="h-10 w-full rounded-xl border-border bg-card px-4 font-bold text-foreground hover:border-ring hover:bg-accent focus-visible:ring-ring"
                                    >
                                        <ShieldPlus className="size-4" />
                                        Make owner
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="border-border bg-card sm:max-w-md">
                                    <DialogTitle className="text-foreground">
                                        Transfer ownership to {member.name}?
                                    </DialogTitle>
                                    <DialogDescription className="text-sm leading-6 text-muted-foreground">
                                        {member.name} will become the new group
                                        owner immediately. You will stay in the
                                        group as a member, but owner controls
                                        move to them.
                                    </DialogDescription>
                                    <div className="rounded-2xl border border-border bg-accent px-4 py-3 text-sm leading-6 text-foreground">
                                        After this transfer, use the regular
                                        group page as a normal member. Only the
                                        new owner will keep access to this
                                        settings page.
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
                                                        className="rounded-lg font-bold"
                                                    >
                                                        Cancel
                                                    </Button>
                                                </DialogClose>

                                                <Button
                                                    type="submit"
                                                    disabled={processing}
                                                    className="rounded-lg font-bold"
                                                >
                                                    {processing && <Spinner />}
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
                                <DialogContent className="border-border bg-card sm:max-w-md">
                                    <DialogTitle className="text-foreground">
                                        Remove AI participant from this group?
                                    </DialogTitle>
                                    <DialogDescription className="text-sm leading-6 text-muted-foreground">
                                        The AI participant will be removed from
                                        the group immediately. Existing AI
                                        predictions stay recorded in the
                                        leaderboard.
                                    </DialogDescription>

                                    <Form
                                        {...RemoveAiParticipantController.form({
                                            scoreboard: leagueId,
                                        })}
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
                                                        className="rounded-lg font-bold"
                                                    >
                                                        Cancel
                                                    </Button>
                                                </DialogClose>

                                                <Button
                                                    type="submit"
                                                    variant="destructive"
                                                    disabled={processing}
                                                    className="rounded-lg font-bold"
                                                >
                                                    {processing && <Spinner />}
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
                                <DialogContent className="border-border bg-card sm:max-w-md">
                                    <DialogTitle className="text-foreground">
                                        Remove {member.name} from this group?
                                    </DialogTitle>
                                    <DialogDescription className="text-sm leading-6 text-muted-foreground">
                                        This removes their access to the group
                                        immediately. Existing predictions stay
                                        recorded, but they will no longer appear
                                        as an active member.
                                    </DialogDescription>

                                    <Form
                                        {...RemoveLeagueMemberController.form({
                                            scoreboard: leagueId,
                                            member: member.id,
                                        })}
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
                                                        className="rounded-lg font-bold"
                                                    >
                                                        Cancel
                                                    </Button>
                                                </DialogClose>

                                                <Button
                                                    type="submit"
                                                    variant="destructive"
                                                    disabled={processing}
                                                    className="rounded-lg font-bold"
                                                >
                                                    {processing && <Spinner />}
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
                    <Badge className="rounded-full bg-amber-950/40 px-2.5 py-1 font-bold text-amber-200">
                        Protected role
                    </Badge>
                )}
            </div>
        </div>
    );
}
