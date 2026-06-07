import { Check, Copy, Link2, Share2, Sparkles, Ticket } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/forms/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/layout/card';
import { useClipboard } from '@/hooks/use-clipboard';

type Props = {
    leagueName: string;
    leagueIcon: string;
    code: string;
    joinHref: string;
    membersCount: number;
};

export default function InviteCodeCard({
    leagueName,
    leagueIcon,
    code,
    joinHref,
    membersCount,
}: Props) {
    const [copiedText, copy] = useClipboard();
    const isCopyingCode = copiedText === code;
    const isCopyingJoinLink = copiedText === joinHref;
    const isSmallLeague = membersCount <= 3;

    const shareMessage = [
        `Join my MondialIQ prediction group ${leagueIcon} "${leagueName}".`,
        `Use code: ${code}`,
        `Join here: ${joinHref}`,
    ].join(' ');

    const copyCode = async () => {
        const success = await copy(code);

        if (!success) {
            toast.error('Copy is not available on this device.');

            return;
        }

        toast.success('Invite code copied.');
    };

    const copyJoinLink = async () => {
        const success = await copy(joinHref);

        if (!success) {
            toast.error('Could not copy the join link.');

            return;
        }

        toast.success('Join link copied.');
    };

    const shareInvite = async () => {
        if (
            typeof navigator !== 'undefined' &&
            typeof navigator.share === 'function'
        ) {
            try {
                await navigator.share({
                    title: `${leagueName} on MondialIQ`,
                    text: `Join my MondialIQ prediction group ${leagueIcon} "${leagueName}" with code ${code}.`,
                    url: joinHref,
                });

                return;
            } catch {
                toast.error('Could not share this invite on your device.');
            }
        }

        const success = await copy(shareMessage);

        if (!success) {
            toast.error('Could not share this invite on your device.');

            return;
        }

        toast.success('Invite message copied.');
    };

    return (
        <Card
            id="league-invite"
            className="gap-0 rounded-2xl border-slate-200 bg-white py-0 shadow-sm"
        >
            <CardHeader className="gap-2 px-4 py-4 sm:px-6">
                <CardTitle className="text-xl font-bold text-slate-900">
                    Invite teammates
                </CardTitle>
                <CardDescription className="text-sm leading-6 text-slate-500">
                    Share this group with friends so they can join your private
                    ranking.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 px-4 pb-4 sm:px-6">
                {isSmallLeague && (
                    <div className="rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50/60 to-white px-4 py-3">
                        <div className="flex items-center gap-2 text-cyan-600">
                            <Sparkles className="size-4" />
                            <p className="text-xs font-bold tracking-wide uppercase">
                                Invite your friends
                            </p>
                        </div>
                        <p className="mt-2 text-sm font-bold text-slate-900">
                            This group is just getting started.
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                            Share the direct join link or send the invite code
                            so your group can start competing faster.
                        </p>
                    </div>
                )}

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="flex items-center gap-2 text-slate-500">
                        <Ticket className="size-4 text-slate-600" />
                        <p className="text-xs font-bold tracking-wide uppercase">
                            Invite code
                        </p>
                    </div>
                    <p className="mt-3 overflow-hidden font-mono text-2xl font-bold tracking-wide text-slate-900 sm:text-3xl">
                        {code}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                        Best result: send the join link for one-tap access and
                        keep this code as a backup.
                    </p>
                </div>

                <div className="grid gap-2">
                    <Button
                        type="button"
                        className="h-10 w-full rounded-xl bg-slate-900 px-4 font-bold text-white hover:bg-blue-900 focus-visible:ring-cyan-300"
                        disabled={isCopyingCode || isCopyingJoinLink}
                        onClick={shareInvite}
                    >
                        <Share2 className="size-4" />
                        Share invite
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        aria-label="Copy invite code"
                        className="h-10 w-full rounded-xl border-slate-200 bg-white px-4 font-bold text-slate-700 hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
                        disabled={isCopyingCode || isCopyingJoinLink}
                        onClick={copyCode}
                    >
                        {isCopyingCode ? (
                            <Check className="size-4" />
                        ) : (
                            <Copy className="size-4" />
                        )}
                        {isCopyingCode ? 'Copied' : 'Copy code'}
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        aria-label="Copy invite link"
                        className="h-10 w-full rounded-xl border-slate-200 bg-white px-4 font-bold text-slate-700 hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
                        disabled={isCopyingCode || isCopyingJoinLink}
                        onClick={copyJoinLink}
                    >
                        {isCopyingJoinLink ? (
                            <Check className="size-4" />
                        ) : (
                            <Link2 className="size-4" />
                        )}
                        {isCopyingJoinLink ? 'Copied' : 'Copy join link'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
