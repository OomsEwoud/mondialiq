interface Props {
    colSpan: number;
}

export default function QualificationCutoffRow({ colSpan }: Props) {
    return (
        <tr>
            <td colSpan={colSpan} className="bg-white px-4 py-3">
                <div className="flex items-center gap-3 text-xs font-bold tracking-wide text-slate-400 uppercase">
                    <span className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-200 to-amber-200" />
                    <span>Qualification cutoff</span>
                    <span className="h-px flex-1 bg-gradient-to-r from-amber-200 via-amber-200 to-transparent" />
                </div>
            </td>
        </tr>
    );
}
