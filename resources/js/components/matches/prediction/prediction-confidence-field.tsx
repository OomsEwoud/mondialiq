import { Button } from '@/components/ui/forms/button';
import { Label } from '@/components/ui/forms/label';
import type { PredictionConfidence } from '@/types/match-prediction';

const confidenceOptions: PredictionConfidence[] = ['low', 'medium', 'high'];

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
        <div className="grid gap-2">
            <Label>Confidence</Label>
            <div className="grid grid-cols-3 gap-2">
                {confidenceOptions.map((confidence) => (
                    <Button
                        key={confidence}
                        type="button"
                        variant={
                            value === confidence ? 'default' : 'outline'
                        }
                        disabled={disabled}
                        onClick={() => onChange(confidence)}
                        className="capitalize"
                    >
                        {confidence}
                    </Button>
                ))}
            </div>
            {error && (
                <p className="text-sm font-medium text-red-600">{error}</p>
            )}
        </div>
    );
}
