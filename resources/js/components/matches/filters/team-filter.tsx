import { Search, X } from 'lucide-react';
import { useTeamSearch } from '@/hooks/use-team-search';

interface Props {
    teams: string[];
    selected: string;
    onChange: (value: string) => void;
}

export default function TeamFilter({ teams, selected, onChange }: Props) {
    const { inputRef, open, setOpen, setActiveIndex, safeIndex, matches } =
        useTeamSearch(teams, selected);

    const handleClear = () => {
        onChange('');
        setOpen(false);
        inputRef.current?.focus();
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setOpen(true);
            setActiveIndex((i) =>
                matches.length === 0 ? 0 : (i + 1) % matches.length,
            );
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActiveIndex((i) =>
                matches.length === 0
                    ? 0
                    : (i - 1 + matches.length) % matches.length,
            );
        } else if (event.key === 'Escape') {
            setOpen(false);
        } else if (event.key === 'Enter' && open) {
            const choice = matches[safeIndex];

            if (choice) {
                event.preventDefault();
                onChange(choice);
                setOpen(false);
            }
        }
    };

    return (
        <div className="relative grid gap-2 text-xs font-bold tracking-wide text-slate-500 uppercase">
            Team
            <div className="relative">
                <Search
                    aria-hidden
                    className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-cyan-600"
                />
                <input
                    ref={inputRef}
                    type="search"
                    value={selected}
                    placeholder="Search team"
                    onFocus={() => setOpen(true)}
                    onBlur={() => window.setTimeout(() => setOpen(false), 120)}
                    onChange={(e) => {
                        onChange(e.target.value);
                        setOpen(true);
                        setActiveIndex(0);
                    }}
                    onKeyDown={handleKeyDown}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 pr-11 pl-11 text-sm font-semibold text-slate-800 normal-case shadow-sm transition-all outline-none placeholder:text-slate-400 hover:border-cyan-200 hover:bg-white focus:border-cyan-300 focus:ring-4 focus:ring-slate-200"
                />
                {selected && (
                    <button
                        type="button"
                        onClick={handleClear}
                        aria-label="Clear team"
                        className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:outline-none"
                    >
                        <X size={15} />
                    </button>
                )}
            </div>
            {open && matches.length > 0 && (
                <div className="absolute top-full left-0 z-20 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white/98 py-1.5 shadow-sm">
                    {matches.map((team, index) => (
                        <button
                            key={team}
                            type="button"
                            onMouseEnter={() => setActiveIndex(index)}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                onChange(team);
                                setOpen(false);
                            }}
                            className={[
                                'block w-full px-4 py-2.5 text-left text-sm font-semibold normal-case transition-colors',
                                index === safeIndex
                                    ? 'bg-cyan-50 text-cyan-700'
                                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900',
                            ].join(' ')}
                        >
                            {team}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
