import { Button } from '@/components/ui/forms/button';
import { Label } from '@/components/ui/forms/label';
import { cn } from '@/lib/utils';
import type { PredictionConfidence } from '@/types/match-prediction';

const confidenceOptions: {
    value: PredictionConfidence;
    label: string;
    helper: string;
}[] = [
    { value: 'low', label: 'Low', helper: 'Unsure' },
    { value: 'medium', label: 'Medium', helper: 'Balanced' },
    { value: 'high', label: 'High', helper: 'Strong feeling' },
];

interface Props {
    value: string;
    disabled: boolean;
    error?: string;
    onChange: (confidence: PredictionConfidence) => void;
}

export default function PredictionConfidenceField({
    value,
    disabled,
    error,
    onChange,
}: Props) {
    return (
        <div className="grid gap-2.5">
            <Label className="text-sm font-black text-slate-900">
                Confidence
            </Label>
            <div
                role="radiogroup"
                aria-label="Prediction confidence"
                className="grid grid-cols-1 gap-2 rounded-2xl border border-slate-200 bg-slate-50/70 p-1.5 sm:grid-cols-3"
            >
                {confidenceOptions.map((option) => {
                    const isSelected = value === option.value;

                    return (
                        <Button
                            key={option.value}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            variant="outline"
                            disabled={disabled}
                            onClick={() => onChange(option.value)}
                            className={cn(
                                'h-auto rounded-xl border px-3 py-2.5 shadow-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2',
                                isSelected
                                    ? 'border-blue-950 bg-blue-950 text-white hover:bg-blue-900 hover:text-white'
                                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                            )}
                        >
                            <span className="grid gap-0.5 text-left">
                                <span className="text-sm font-black">
                                    {option.label}
                                </span>
                                <span
                                    className={cn(
                                        'text-[11px] font-medium',
                                        isSelected
                                            ? 'text-cyan-100'
                                            : 'text-slate-500',
                                    )}
                                >
                                    {option.helper}
                                </span>
                            </span>
                        </Button>
                    );
                })}
            </div>
            {error && (
                <p className="text-sm font-medium text-red-600">{error}</p>
            )}
        </div>
    );
}
