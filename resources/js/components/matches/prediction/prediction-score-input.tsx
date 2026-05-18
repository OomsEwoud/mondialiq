import { Input } from '@/components/ui/forms/input';
import { Label } from '@/components/ui/forms/label';

interface Props {
    id: string;
    label: string;
    value: string;
    disabled: boolean;
    error?: string;
    onChange: (score: string) => void;
}

export default function PredictionScoreInput({
    id,
    label,
    value,
    disabled,
    error,
    onChange,
}: Props) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            <Input
                id={id}
                type="number"
                min="0"
                max="99"
                inputMode="numeric"
                value={value}
                disabled={disabled}
                onChange={(event) => onChange(event.target.value)}
            />
            {error && (
                <p className="text-sm font-medium text-red-600">{error}</p>
            )}
        </div>
    );
}
