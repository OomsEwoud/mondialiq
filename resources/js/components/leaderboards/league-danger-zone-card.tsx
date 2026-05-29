import { Form } from '@inertiajs/react';
import { AlertTriangle, Trash2 } from 'lucide-react';
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
import DeleteLeagueController from '@/actions/App/Http/Controllers/Leagues/DeleteLeagueController';

type Props = {
    leagueId: number;
    leagueName: string;
};

export default function LeagueDangerZoneCard({
    leagueId,
    leagueName,
}: Props) {
    return (
        <Card className="rounded-2xl border-rose-200 bg-rose-50 shadow-sm">
            <CardHeader className="gap-2 px-4 py-5 sm:px-6">
                <div className="flex items-center gap-2 text-rose-700">
                    <AlertTriangle className="size-4" />
                    <p className="text-xs font-black tracking-[0.16em] uppercase">
                        Danger zone
                    </p>
                </div>
                <CardTitle className="text-2xl font-black text-rose-950">
                    Delete league
                </CardTitle>
                <CardDescription className="text-sm leading-6 text-rose-900/80">
                    This permanently removes {leagueName}, the invite code, and
                    membership access for everyone in the group.
                </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-5 sm:px-6">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button
                            type="button"
                            variant="destructive"
                            className="h-11 w-full rounded-lg px-5 font-black"
                        >
                            <Trash2 className="size-4" />
                            Delete league
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="border-slate-200 bg-white sm:max-w-md">
                        <DialogTitle className="text-blue-950">
                            Delete {leagueName}?
                        </DialogTitle>
                        <DialogDescription className="text-sm leading-6 text-slate-600">
                            This action cannot be undone. All members lose access
                            immediately and the league page will disappear from
                            leaderboards.
                        </DialogDescription>

                        <Form
                            {...DeleteLeagueController.form({
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
                                        <Trash2 className="size-4" />
                                        {processing
                                            ? 'Deleting...'
                                            : 'Confirm delete'}
                                    </Button>
                                </DialogFooter>
                            )}
                        </Form>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}
