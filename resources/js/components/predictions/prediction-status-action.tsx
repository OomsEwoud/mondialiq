import { ArrowRight, CheckCircle2, LockKeyhole } from 'lucide-react';
import { Button } from '@/components/ui/forms/button';

interface Props {
    available: boolean;
}

export default function PredictionStatusAction({ available }: Props) {
    if (available) {
        return (
            <div className="inline-flex w-fit items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                Available
            </div>
        );
    }

    return (
        <Button
            type="button"
            variant="outline"
            className="w-fit border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 focus-visible:ring-red-200"
        >
            <LockKeyhole className="h-4 w-4" />
            Buy AI Prediction
            <ArrowRight className="h-4 w-4" />
        </Button>
    );
}
