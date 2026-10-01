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
        <div className="grid gap-2 rounded-2xl border border-border bg-card p-3">
            <Label htmlFor={id} className="text-xs font-bold text-foreground">
                {label}
            </Label>
            <Input
                id={id}
                type="number"
                min="0"
                max="99"
                inputMode="numeric"
                value={value}
                disabled={disabled}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${id}-error` : undefined}
                onChange={(event) =>
                    onChange(event.target.value.replace(/[^\d]/g, ''))
                }
                className="h-12 rounded-xl border-border bg-muted/60 text-center text-lg font-bold text-foreground shadow-none focus-visible:border-ring focus-visible:ring-ring"
            />
            {error && (
                <p
                    id={`${id}-error`}
                    role="alert"
                    className="text-sm font-medium text-destructive"
                >
                    {error}
                </p>
            )}
        </div>
    );
}
