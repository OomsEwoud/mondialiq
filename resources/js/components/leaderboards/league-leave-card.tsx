import { Form } from '@inertiajs/react';
import { LogOut } from 'lucide-react';
import LeaveLeagueController from '@/actions/App/Http/Controllers/Leagues/LeaveLeagueController';
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
import { cn } from '@/lib/utils';

type Props = {
    leagueId: number;
    leagueName: string;
    className?: string;
};

export default function LeagueLeaveCard({
    leagueId,
    leagueName,
    className,
}: Props) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    className={cn(
                        'h-11 rounded-lg border-rose-200 bg-white px-5 font-bold text-rose-900 shadow-sm  hover:bg-rose-50',
                        className,
                    )}
                >
                    <LogOut className="size-4" />
                    Leave group
                </Button>
            </DialogTrigger>
            <DialogContent className="border-slate-200 bg-white sm:max-w-md">
                <DialogTitle className="text-slate-900">
                    Leave {leagueName}?
                </DialogTitle>
                <DialogDescription className="text-sm leading-6 text-slate-600">
                    You will lose access to this private group immediately. If
                    you want to come back later, you will need a fresh invite.
                </DialogDescription>

                <Form
                    {...LeaveLeagueController.form({
                        scoreboard: leagueId,
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
                                <LogOut className="size-4" />
                                {processing ? 'Leaving...' : 'Confirm leave'}
                            </Button>
                        </DialogFooter>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
