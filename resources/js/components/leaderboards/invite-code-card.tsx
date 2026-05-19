import { Copy, Link2, Share2, Sparkles, Ticket } from 'lucide-react';
import { toast } from 'sonner';
import { useClipboard } from '@/hooks/use-clipboard';
import { Button } from '@/components/ui/forms/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/layout/card';

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
        `Join my MondialIQ friends league ${leagueIcon} "${leagueName}".`,
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
        if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
            try {
                await navigator.share({
                    title: `${leagueName} on MondialIQ`,
                    text: `Join my MondialIQ friends league ${leagueIcon} "${leagueName}" with code ${code}.`,
                    url: joinHref,
                });
                return;
            } catch {
                // Fall back to copying the share text below when native share is dismissed or unavailable.
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
            className="rounded-2xl border-slate-200 bg-white shadow-sm"
        >
            <CardHeader className="gap-2 px-4 py-5 sm:px-6">
                <CardTitle className="text-xl font-black text-blue-950">
                    Invite teammates
                </CardTitle>
                <CardDescription className="text-sm leading-6 text-slate-500">
                    Share this league code so friends can join your private
                    standings.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-4 pb-5 sm:px-6">
                {isSmallLeague && (
                    <div className="rounded-2xl border border-cyan-200 bg-linear-to-r from-cyan-50 via-white to-blue-50 px-4 py-4">
                        <div className="flex items-center gap-2 text-cyan-700">
                            <Sparkles className="size-4" />
                            <p className="text-xs font-black tracking-[0.16em] uppercase">
                                Invite your friends
                            </p>
                        </div>
                        <p className="mt-2 text-sm font-black text-blue-950">
                            This league is just getting started.
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                            Share the direct join link or send the invite code so your group can start competing faster.
                        </p>
                    </div>
                )}

                <div className="rounded-2xl border border-slate-200 bg-linear-to-r from-slate-50 to-white px-4 py-4">
                    <div className="flex items-center gap-2 text-slate-500">
                        <Ticket className="size-4 text-cyan-600" />
                        <p className="text-xs font-black tracking-[0.16em] uppercase">
                            Invite code
                        </p>
                    </div>
                    <p className="mt-3 text-2xl font-black tracking-[0.28em] text-blue-950 sm:text-3xl">
                        {code}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                        Best result: send the join link for one-tap access and keep this code as a backup.
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <div className="flex items-center gap-2 text-slate-500">
                        <Share2 className="size-4 text-cyan-600" />
                        <p className="text-xs font-black tracking-[0.16em] uppercase">
                            Share text
                        </p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                        {shareMessage}
                    </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    <Button
                        type="button"
                        variant="outline"
                        className="h-10 w-full rounded-lg px-4 font-black"
                        disabled={isCopyingCode || isCopyingJoinLink}
                        onClick={copyCode}
                    >
                        <Copy className="size-4" />
                        {isCopyingCode ? 'Copied' : 'Copy code'}
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        className="h-10 w-full rounded-lg px-4 font-black"
                        disabled={isCopyingCode || isCopyingJoinLink}
                        onClick={copyJoinLink}
                    >
                        <Link2 className="size-4" />
                        {isCopyingJoinLink ? 'Copied' : 'Copy join link'}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        className="h-10 w-full rounded-lg border-cyan-200 bg-white px-4 font-black text-cyan-900 hover:bg-cyan-50"
                        disabled={isCopyingCode || isCopyingJoinLink}
                        onClick={shareInvite}
                    >
                        <Share2 className="size-4" />
                        Share invite
                    </Button>

                </div>
            </CardContent>
        </Card>
    );
}
