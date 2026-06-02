import { Lock, PencilLine } from 'lucide-react';
import { Button } from '@/components/ui/forms/button';
import { cn } from '@/lib/utils';

interface Props {
    locked: boolean;
    onEdit: () => void;
}

export default function UserPredictionActions({ locked, onEdit }: Props) {
    return (
        <section className="flex flex-col gap-2 rounded-[1.7rem] border border-cyan-100 bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(248,250,252,0.96))] p-5 shadow-xl shadow-cyan-950/8 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
                <h2 className="text-xl font-black text-blue-950">
                    Your pick
                </h2>
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
                        : 'bg-[linear-gradient(135deg,#16255f_0%,#21326e_100%)] text-white shadow-lg shadow-blue-950/20 hover:brightness-105',
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
