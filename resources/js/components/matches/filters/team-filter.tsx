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
        <div className="relative grid gap-2 text-xs font-bold text-[#89928c]">
            Ploeg
            <div className="relative">
                <Search
                    aria-hidden
                    className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#70b98e]"
                />
                <input
                    aria-label="Zoek een ploeg"
                    ref={inputRef}
                    type="search"
                    value={selected}
                    placeholder="Zoek een ploeg"
                    onFocus={() => setOpen(true)}
                    onBlur={() => window.setTimeout(() => setOpen(false), 120)}
                    onChange={(e) => {
                        onChange(e.target.value);
                        setOpen(true);
                        setActiveIndex(0);
                    }}
                    onKeyDown={handleKeyDown}
                    className="h-11 w-full rounded-md border border-[#343d37] bg-[#0d110f] pr-10 pl-10 text-sm font-semibold text-[#daddd9] normal-case transition-colors outline-none placeholder:text-[#59615c] hover:border-[#536159] focus:border-[#57ad78] focus:ring-2 focus:ring-[#57ad78]/20"
                />
                {selected && (
                    <button
                        type="button"
                        onClick={handleClear}
                        aria-label="Clear team"
                        className="absolute top-1/2 right-3 -translate-y-1/2 rounded-sm p-1 text-[#717a74] transition-colors hover:bg-[#1b211e] hover:text-white focus-visible:ring-2 focus-visible:ring-[#57ad78] focus-visible:outline-none"
                    >
                        <X size={15} />
                    </button>
                )}
            </div>
            {open && matches.length > 0 && (
                <div className="absolute top-full left-0 z-20 mt-2 w-full overflow-hidden rounded-md border border-[#343d37] bg-[#141916] py-1.5 shadow-2xl shadow-black/40">
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
                                    ? 'bg-[#223129] text-[#8fd0a8]'
                                    : 'text-[#b8bfba] hover:bg-[#1b211e] hover:text-white',
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
