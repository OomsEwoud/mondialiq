import { Form } from '@inertiajs/react'
import { Crown, ShieldCheck, UserMinus } from 'lucide-react'
import RemoveLeagueMemberController from '@/actions/App/Http/Controllers/Leagues/RemoveLeagueMemberController'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/display/avatar'
import { Badge } from '@/components/ui/feedback/badge'
import { Spinner } from '@/components/ui/feedback/spinner'
import { Button } from '@/components/ui/forms/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/layout/card'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/overlays/dialog'
import { useInitials } from '@/hooks/use-initials'
import { cn } from '@/lib/utils'
import type { LeagueMember } from '@/types/league'

type Props = {
    leagueId: number
    members: LeagueMember[]
}

export default function LeagueMembersManagementCard({ leagueId, members }: Props) {
    const getInitials = useInitials()

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
                    Owners are marked clearly, and removable members are highlighted for a future management flow.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 px-4 pb-5 sm:px-6">
                {members.map((member) => (
                    <div
                        key={member.id}
                        className={cn(
                            'flex items-center justify-between gap-3 rounded-2xl border px-4 py-4',
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

                        <div className="shrink-0">
                            {member.canBeManaged ? (
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            className="h-10 rounded-lg px-4 font-black"
                                        >
                                            <UserMinus className="size-4" />
                                            Remove member
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="border-slate-200 bg-white sm:max-w-md">
                                        <DialogTitle className="text-blue-950">
                                            Remove {member.name} from this league?
                                        </DialogTitle>
                                        <DialogDescription className="text-sm leading-6 text-slate-600">
                                            This removes their access to the league immediately. Existing predictions stay recorded, but they will no longer appear as an active member.
                                        </DialogDescription>

                                        <Form
                                            {...RemoveLeagueMemberController.form({
                                                scoreboard: leagueId,
                                                member: member.id,
                                            })}
                                            options={{ preserveScroll: true }}
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
                                                        disabled={processing}
                                                        className="rounded-lg font-black"
                                                    >
                                                        {processing && <Spinner />}
                                                        <UserMinus className="size-4" />
                                                        {processing ? 'Removing...' : 'Confirm remove'}
                                                    </Button>
                                                </DialogFooter>
                                            )}
                                        </Form>
                                    </DialogContent>
                                </Dialog>
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
    )
}
