import { Copy, Link2, LogIn, Ticket } from 'lucide-react';
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
    code: string;
    joinHref: string;
};

export default function InviteCodeCard({ code, joinHref }: Props) {
    const [copiedText, copy] = useClipboard();
    const isCopyingCode = copiedText === code;
    const isCopyingJoinLink = copiedText === joinHref;

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

    return (
        <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
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
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                        type="button"
                        variant="outline"
                        className="h-10 w-full rounded-lg px-4 font-black sm:w-auto"
                        disabled={isCopyingCode || isCopyingJoinLink}
                        onClick={copyCode}
                    >
                        <Copy className="size-4" />
                        {isCopyingCode ? 'Copied' : 'Copy code'}
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        className="h-10 w-full rounded-lg px-4 font-black sm:w-auto"
                        disabled={isCopyingCode || isCopyingJoinLink}
                        onClick={copyJoinLink}
                    >
                        <Link2 className="size-4" />
                        {isCopyingJoinLink ? 'Copied' : 'Copy join link'}
                    </Button>

                    <Button
                        asChild
                        className="h-10 w-full rounded-lg px-4 font-black sm:w-auto"
                    >
                        <a href={joinHref}>
                            <LogIn className="size-4" />
                            Join League
                        </a>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
