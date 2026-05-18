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
        <div className="relative grid gap-1.5 text-xs font-bold text-slate-500 uppercase">
            Team
            <div className="relative">
                <Search
                    aria-hidden
                    className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-blue-600"
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
                    className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 pr-10 pl-10 text-sm font-medium text-slate-800 normal-case transition-colors outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
                {selected && (
                    <button
                        type="button"
                        onClick={handleClear}
                        aria-label="Clear team"
                        className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 transition-colors hover:text-blue-700"
                    >
                        <X size={15} />
                    </button>
                )}
            </div>
            {open && matches.length > 0 && (
                <div className="absolute top-full left-0 z-20 mt-2 overflow-hidden rounded-md border border-slate-200 bg-white py-1 shadow-lg">
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
                                'block w-full px-3 py-2 text-left text-sm font-medium normal-case transition-colors',
                                index === safeIndex
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-slate-700 hover:bg-blue-50 hover:text-blue-700',
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
