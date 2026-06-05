import { Form } from '@inertiajs/react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { useState } from 'react';
import DeleteLeagueController from '@/actions/App/Http/Controllers/Leagues/DeleteLeagueController';
import { Spinner } from '@/components/ui/feedback/spinner';
import { Button } from '@/components/ui/forms/button';
import { Input } from '@/components/ui/forms/input';
import { Label } from '@/components/ui/forms/label';
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

type Props = {
    leagueId: number;
    leagueName: string;
};

export default function LeagueDangerZoneCard({ leagueId, leagueName }: Props) {
    const [confirmText, setConfirmText] = useState('');
    const canDelete = confirmText === 'DELETE';

    return (
        <Card className="rounded-2xl border-red-200 bg-red-50/30 shadow-sm">
            <CardHeader className="gap-2 px-4 py-5 sm:px-5">
                <div className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="size-4" />
                    <p className="text-xs font-black tracking-[0.16em] uppercase">
                        Danger zone
                    </p>
                </div>
                <CardTitle className="text-xl font-black text-red-950">
                    Delete group
                </CardTitle>
                <CardDescription className="text-sm leading-6 text-red-900/80">
                    This permanently deletes the group, invite code and member
                    access. This cannot be undone.
                </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-5 sm:px-5">
                <Dialog onOpenChange={() => setConfirmText('')}>
                    <DialogTrigger asChild>
                        <Button
                            type="button"
                            variant="destructive"
                            className="h-11 w-full rounded-xl bg-red-600 px-5 font-black text-white hover:bg-red-700 focus-visible:ring-red-200"
                        >
                            <Trash2 className="size-4" />
                            Delete group
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="border-slate-200 bg-white sm:max-w-md">
                        <DialogTitle className="text-blue-950">
                            Delete {leagueName}?
                        </DialogTitle>
                        <DialogDescription className="text-sm leading-6 text-slate-600">
                            This action cannot be undone. All members lose
                            access immediately and the group page disappears
                            from leaderboards.
                        </DialogDescription>
                        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800">
                            Type <span className="font-black">DELETE</span> to
                            confirm this permanent action.
                        </div>

                        <Form
                            {...DeleteLeagueController.form({
                                scoreboard: leagueId,
                            })}
                            options={{ preserveScroll: true }}
                            className="space-y-4"
                        >
                            {({ processing }) => (
                                <>
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="delete-league-confirm"
                                            className="text-xs font-black tracking-widest text-slate-500 uppercase"
                                        >
                                            Confirmation
                                        </Label>
                                        <Input
                                            id="delete-league-confirm"
                                            value={confirmText}
                                            onChange={(event) =>
                                                setConfirmText(
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Type DELETE"
                                            className="h-11 rounded-xl border-slate-200 focus-visible:border-red-300 focus-visible:ring-red-200"
                                            autoComplete="off"
                                        />
                                    </div>

                                    <DialogFooter className="gap-2">
                                        <DialogClose asChild>
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                className="rounded-xl font-black"
                                            >
                                                Cancel
                                            </Button>
                                        </DialogClose>

                                        <Button
                                            type="submit"
                                            variant="destructive"
                                            disabled={processing || !canDelete}
                                            className="rounded-xl bg-red-600 font-black text-white hover:bg-red-700 focus-visible:ring-red-200"
                                        >
                                            {processing && <Spinner />}
                                            <Trash2 className="size-4" />
                                            {processing
                                                ? 'Deleting...'
                                                : 'Confirm delete'}
                                        </Button>
                                    </DialogFooter>
                                </>
                            )}
                        </Form>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}
