import { Lock, PencilLine } from 'lucide-react';
import { Button } from '@/components/ui/forms/button';
import { cn } from '@/lib/utils';

interface Props {
    locked: boolean;
    onEdit: () => void;
}

export default function UserPredictionActions({ locked, onEdit }: Props) {
    return (
        <section className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
                <h2 className="text-base font-black text-blue-950">
                    Your pick
                </h2>
                <p className="mt-1 text-sm font-medium text-slate-500">
                    {locked
                        ? 'This prediction is locked because the match has started.'
                        : 'You can still adjust your prediction before kickoff.'}
                </p>
            </div>

            <Button
                type="button"
                disabled={locked}
                className={cn(
                    'justify-center',
                    locked
                        ? 'bg-slate-200 text-slate-500'
                        : 'bg-blue-950 text-white hover:bg-cyan-500 hover:text-blue-950',
                )}
                onClick={onEdit}
            >
                {locked ? (
                    <>
                        <Lock className="size-4" />
                        Prediction locked
                    </>
                ) : (
                    <>
                        <PencilLine className="size-4" />
                        Edit prediction
                    </>
                )}
            </Button>
        </section>
    );
}
