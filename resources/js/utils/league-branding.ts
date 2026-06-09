import { cn } from '@/lib/utils';
import type { LeagueAccentColor, LeagueCoverStyle } from '@/types/league';

const defaultAccentColor: LeagueAccentColor = 'cyan';
const defaultCoverStyle: LeagueCoverStyle = 'stadium';

export const leagueIconOptions = [
    { value: '🏆', label: 'Trophy' },
    { value: '🔥', label: 'Fire' },
    { value: '🌍', label: 'World' },
    { value: '⚡', label: 'Bolt' },
    { value: '⭐', label: 'Star' },
    { value: '🎯', label: 'Target' },
] as const;

export const leagueAccentOptions: Array<{
    value: LeagueAccentColor;
    label: string;
    dotClassName: string;
}> = [
    { value: 'cyan', label: 'Cyan', dotClassName: 'bg-cyan-400' },
    { value: 'emerald', label: 'Emerald', dotClassName: 'bg-emerald-400' },
    { value: 'amber', label: 'Amber', dotClassName: 'bg-amber-400' },
    { value: 'rose', label: 'Rose', dotClassName: 'bg-rose-400' },
    { value: 'violet', label: 'Violet', dotClassName: 'bg-violet-400' },
    { value: 'blue', label: 'Blue', dotClassName: 'bg-blue-400' },
] as const;

export const leagueCoverOptions: Array<{
    value: LeagueCoverStyle;
    label: string;
    description: string;
}> = [
    {
        value: 'stadium',
        label: 'Stadium',
        description: 'Bright matchday energy',
    },
    {
        value: 'spotlight',
        label: 'Spotlight',
        description: 'Premium broadcast feel',
    },
    {
        value: 'pitch',
        label: 'Pitch',
        description: 'Fresh tournament greens',
    },
    {
        value: 'night',
        label: 'Night',
        description: 'Big game under lights',
    },
] as const;

const accentPalettes: Record<
    LeagueAccentColor,
    {
        soft: string;
        softText: string;
        ring: string;
        badge: string;
        button: string;
    }
> = {
    cyan: {
        soft: 'bg-cyan-50',
        softText: 'text-cyan-700',
        ring: 'ring-cyan-200',
        badge: 'border-cyan-200 bg-cyan-50 text-cyan-900',
        button: 'border-cyan-200 text-cyan-900 hover:bg-cyan-50',
    },
    emerald: {
        soft: 'bg-emerald-50',
        softText: 'text-emerald-700',
        ring: 'ring-emerald-200',
        badge: 'border-emerald-200 bg-emerald-50 text-emerald-900',
        button: 'border-emerald-200 text-emerald-900 hover:bg-emerald-50',
    },
    amber: {
        soft: 'bg-amber-50',
        softText: 'text-amber-700',
        ring: 'ring-amber-200',
        badge: 'border-amber-200 bg-amber-50 text-amber-900',
        button: 'border-amber-200 text-amber-900 hover:bg-amber-50',
    },
    rose: {
        soft: 'bg-rose-50',
        softText: 'text-rose-700',
        ring: 'ring-rose-200',
        badge: 'border-rose-200 bg-rose-50 text-rose-900',
        button: 'border-rose-200 text-rose-900 hover:bg-rose-50',
    },
    violet: {
        soft: 'bg-violet-50',
        softText: 'text-violet-700',
        ring: 'ring-violet-200',
        badge: 'border-violet-200 bg-violet-50 text-violet-900',
        button: 'border-violet-200 text-violet-900 hover:bg-violet-50',
    },
    blue: {
        soft: 'bg-blue-50',
        softText: 'text-blue-700',
        ring: 'ring-blue-200',
        badge: 'border-blue-200 bg-blue-50 text-blue-900',
        button: 'border-blue-200 text-blue-900 hover:bg-blue-50',
    },
};

const coverClasses: Record<LeagueCoverStyle, string> = {
    stadium:
        'bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.95),_rgba(255,255,255,0.5)_26%,_transparent_60%),linear-gradient(135deg,_#082f49_0%,_#0f766e_45%,_#38bdf8_100%)]',
    spotlight:
        'bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.95),_rgba(255,255,255,0.1)_34%,_transparent_64%),linear-gradient(135deg,_#1e293b_0%,_#312e81_48%,_#0f766e_100%)]',
    pitch: 'bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.85),_rgba(255,255,255,0.08)_28%,_transparent_60%),linear-gradient(135deg,_#14532d_0%,_#15803d_46%,_#65a30d_100%)]',
    night: 'bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.75),_rgba(255,255,255,0.08)_24%,_transparent_58%),linear-gradient(135deg,_#0f172a_0%,_#1d4ed8_42%,_#0f766e_100%)]',
};

export function getLeagueBrandPalette(accentColor: LeagueAccentColor) {
    return accentPalettes[accentColor] ?? accentPalettes[defaultAccentColor];
}

export function getLeagueCoverClass(coverStyle: LeagueCoverStyle) {
    return coverClasses[coverStyle] ?? coverClasses[defaultCoverStyle];
}

const heroPalettes: Record<
    LeagueAccentColor,
    {
        label: string;
        icon: string;
        badgeBorder: string;
        badgeBg: string;
        badgeText: string;
        primaryButton: string;
        outlineButton: string;
        ring: string;
    }
> = {
    cyan: {
        label: 'text-cyan-300',
        icon: 'text-cyan-300',
        badgeBorder: 'border-cyan-400/20',
        badgeBg: 'bg-cyan-950/30',
        badgeText: 'text-cyan-100',
        primaryButton: 'bg-cyan-600 hover:bg-cyan-500 text-white',
        outlineButton: 'border-cyan-400/30 text-cyan-100 hover:bg-cyan-900/30',
        ring: 'ring-cyan-300',
    },
    emerald: {
        label: 'text-emerald-300',
        icon: 'text-emerald-300',
        badgeBorder: 'border-emerald-400/20',
        badgeBg: 'bg-emerald-950/30',
        badgeText: 'text-emerald-100',
        primaryButton: 'bg-emerald-600 hover:bg-emerald-500 text-white',
        outlineButton: 'border-emerald-400/30 text-emerald-100 hover:bg-emerald-900/30',
        ring: 'ring-emerald-300',
    },
    amber: {
        label: 'text-amber-300',
        icon: 'text-amber-300',
        badgeBorder: 'border-amber-400/20',
        badgeBg: 'bg-amber-950/30',
        badgeText: 'text-amber-100',
        primaryButton: 'bg-amber-600 hover:bg-amber-500 text-white',
        outlineButton: 'border-amber-400/30 text-amber-100 hover:bg-amber-900/30',
        ring: 'ring-amber-300',
    },
    rose: {
        label: 'text-rose-300',
        icon: 'text-rose-300',
        badgeBorder: 'border-rose-400/20',
        badgeBg: 'bg-rose-950/30',
        badgeText: 'text-rose-100',
        primaryButton: 'bg-rose-600 hover:bg-rose-500 text-white',
        outlineButton: 'border-rose-400/30 text-rose-100 hover:bg-rose-900/30',
        ring: 'ring-rose-300',
    },
    violet: {
        label: 'text-violet-300',
        icon: 'text-violet-300',
        badgeBorder: 'border-violet-400/20',
        badgeBg: 'bg-violet-950/30',
        badgeText: 'text-violet-100',
        primaryButton: 'bg-violet-600 hover:bg-violet-500 text-white',
        outlineButton: 'border-violet-400/30 text-violet-100 hover:bg-violet-900/30',
        ring: 'ring-violet-300',
    },
    blue: {
        label: 'text-blue-300',
        icon: 'text-blue-300',
        badgeBorder: 'border-blue-400/20',
        badgeBg: 'bg-blue-950/30',
        badgeText: 'text-blue-100',
        primaryButton: 'bg-blue-600 hover:bg-blue-500 text-white',
        outlineButton: 'border-blue-400/30 text-blue-100 hover:bg-blue-900/30',
        ring: 'ring-blue-300',
    },
};

export function getLeagueHeroPalette(accentColor: LeagueAccentColor) {
    return heroPalettes[accentColor] ?? heroPalettes[defaultAccentColor];
}

export function getLeagueBrandBannerClass(
    accentColor: LeagueAccentColor,
    coverStyle: LeagueCoverStyle,
) {
    return cn(
        'relative overflow-hidden rounded-2xl text-white shadow-sm ring-1',
        getLeagueCoverClass(coverStyle),
        getLeagueBrandPalette(accentColor).ring,
    );
}
