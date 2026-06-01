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
        <div className="grid gap-2 rounded-2xl border border-slate-200 bg-white p-3">
            <Label htmlFor={id} className="text-xs font-black text-slate-700">
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
                onChange={(event) =>
                    onChange(event.target.value.replace(/[^\d]/g, ''))
                }
                className="h-12 rounded-xl border-slate-200 bg-slate-50/60 text-center text-lg font-black text-blue-950 shadow-none focus-visible:border-cyan-300 focus-visible:ring-cyan-200"
            />
            {error && (
                <p className="text-sm font-medium text-red-600">{error}</p>
            )}
        </div>
    );
}
