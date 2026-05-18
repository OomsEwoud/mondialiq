import { useMemo, useRef, useState } from 'react';

export function useTeamSearch(teams: string[], selectedTeam: string) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    const matches = useMemo(() => {
        const search = selectedTeam.trim().toLowerCase();

        return teams
            .map((team) => {
                const normalized = team.toLowerCase();

                if (!search) {
                    return { team, score: 3 };
                }

                if (normalized === search) {
                    return { team, score: 0 };
                }

                if (normalized.startsWith(search)) {
                    return { team, score: 1 };
                }

                if (normalized.includes(search)) {
                    return { team, score: 2 };
                }

                return null;
            })
            .filter((t): t is { team: string; score: number } => t !== null)
            .sort((a, b) => a.score - b.score || a.team.localeCompare(b.team))
            .map((e) => e.team)
            .slice(0, 6);
    }, [selectedTeam, teams]);

    const safeIndex =
        matches.length === 0 ? 0 : Math.min(activeIndex, matches.length - 1);

    return {
        inputRef,
        open,
        setOpen,
        activeIndex,
        setActiveIndex,
        safeIndex,
        matches,
    };
}
