import { Lock, PencilLine } from 'lucide-react';
import { Button } from '@/components/ui/forms/button';
import { cn } from '@/lib/utils';

interface Props {
    locked: boolean;
    onEdit: () => void;
}

export default function UserPredictionActions({ locked, onEdit }: Props) {
    return (
        <section className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
                <h2 className="text-xl font-bold text-slate-900">Your pick</h2>
                <p className="mt-1 text-sm font-medium text-slate-500">
                    {locked
                        ? 'Predictions are locked after kickoff.'
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
                        : 'bg-slate-900 text-white shadow-sm',
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
