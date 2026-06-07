import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/forms/button';

interface Props {
    onZoomChange: (zoom: number) => void;
    zoom: number;
}

export default function AvatarZoomControl({ onZoomChange, zoom }: Props) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <p className="text-xs font-semibold tracking-wide text-cyan-600 uppercase">
                    Zoom
                </p>
                <span className="text-sm font-semibold text-slate-900">
                    {Math.round(zoom * 100)}%
                </span>
            </div>
            <div className="flex items-center gap-3">
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-9 shrink-0 rounded-lg"
                    onClick={() => onZoomChange(Math.max(1, zoom - 0.1))}
                >
                    <Minus className="size-4" />
                </Button>
                <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.01"
                    value={zoom}
                    className="h-2 w-full cursor-pointer accent-cyan-500"
                    onChange={(event) =>
                        onZoomChange(Number(event.target.value))
                    }
                />
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-9 shrink-0 rounded-lg"
                    onClick={() => onZoomChange(Math.min(3, zoom + 0.1))}
                >
                    <Plus className="size-4" />
                </Button>
            </div>
        </div>
    );
}
