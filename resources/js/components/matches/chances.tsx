interface Props {
    homeWin: number;
    draw: number;
    awayWin: number;
}

export default function Chances({ homeWin, draw, awayWin }: Props) {
    return (
        <div className="mt-3 border-t border-slate-100 pt-3">
            <p className="mb-2 text-xs font-medium tracking-wider text-slate-400 uppercase">
                Chances
            </p>
            <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg bg-red-50 p-3 text-center">
                    <p className="text-xs font-medium text-red-400 uppercase">
                        Home win
                    </p>
                    <p className="text-2xl font-bold text-red-500">
                        {homeWin}%
                    </p>
                </div>
                <div className="rounded-lg bg-slate-100 p-3 text-center">
                    <p className="text-xs font-medium text-slate-400 uppercase">
                        Draw
                    </p>
                    <p className="text-2xl font-bold text-slate-600">{draw}%</p>
                </div>
                <div className="rounded-lg bg-blue-50 p-3 text-center">
                    <p className="text-xs font-medium text-blue-400 uppercase">
                        Away win
                    </p>
                    <p className="text-2xl font-bold text-blue-500">
                        {awayWin}%
                    </p>
                </div>
            </div>
        </div>
    );
}
