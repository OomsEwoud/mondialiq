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
            <Label className="text-sm font-bold text-foreground">
                Confidence
            </Label>
            <div
                role="group"
                aria-label="Prediction confidence"
                className="grid grid-cols-1 gap-2 rounded-2xl border border-border bg-muted/70 p-1.5 sm:grid-cols-3"
            >
                {confidenceOptions.map((option) => {
                    const isSelected = value === option.value;

                    return (
                        <Button
                            key={option.value}
                            type="button"
                            aria-pressed={isSelected}
                            variant="outline"
                            disabled={disabled}
                            onClick={() => onChange(option.value)}
                            className={cn(
                                'h-auto rounded-xl border px-3 py-2.5 shadow-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                                isSelected
                                    ? 'border-blue-950 bg-secondary text-white hover:bg-accent hover:text-white'
                                    : 'border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground',
                            )}
                        >
                            <span className="grid gap-0.5 text-left">
                                <span className="text-sm font-bold">
                                    {option.label}
                                </span>
                                <span
                                    className={cn(
                                        'text-xs font-medium',
                                        isSelected
                                            ? 'text-cyan-100'
                                            : 'text-muted-foreground',
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
                <p className="text-sm font-medium text-destructive">{error}</p>
            )}
        </div>
    );
}
