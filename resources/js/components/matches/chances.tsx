interface Props {
    homeWin: number;
    draw: number;
    awayWin: number;
}

export default function Chances({ homeWin, draw, awayWin }: Props) {
    return (
        <div className="mt-3 border-t border-border pt-3">
            <p className="mb-2 text-xs font-medium tracking-wide text-primary uppercase">
                Chances
            </p>
            <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg bg-red-950/40 p-3 text-center">
                    <p className="text-xs font-medium text-red-400 uppercase">
                        Home win
                    </p>
                    <p className="text-2xl font-semibold text-red-500">
                        {homeWin}%
                    </p>
                </div>
                <div className="rounded-lg bg-muted p-3 text-center">
                    <p className="text-xs font-medium text-muted-foreground uppercase">
                        Draw
                    </p>
                    <p className="text-2xl font-semibold text-muted-foreground">
                        {draw}%
                    </p>
                </div>
                <div className="rounded-lg bg-blue-950/40 p-3 text-center">
                    <p className="text-xs font-medium text-blue-400 uppercase">
                        Away win
                    </p>
                    <p className="text-2xl font-semibold text-blue-500">
                        {awayWin}%
                    </p>
                </div>
            </div>
        </div>
    );
}
