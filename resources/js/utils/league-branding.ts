import { cn } from '@/lib/utils';
import type { LeagueAccentColor } from '@/types/league';

const defaultAccentColor: LeagueAccentColor = 'amber';

export const leagueIconOptions = [
    { value: '🏆', label: 'Trophy' },
    { value: '🔥', label: 'Fire' },
    { value: '🌍', label: 'World' },
    { value: '⚡', label: 'Bolt' },
    { value: '⭐', label: 'Star' },
    { value: '🎯', label: 'Target' },
] as const;

export interface LeagueThemePalette {
    banner: string;
    bannerRing: string;
    accentText: string;
    darkAccent: string;
    iconColor: string;
    badgeBorder: string;
    badgeBg: string;
    badgeText: string;
    primaryButton: string;
    secondaryButton: string;
    softBg: string;
    softBorder: string;
    softText: string;
    rankFirst: string;
    currentUserHighlight: string;
    buttonRing: string;
    inviteIcon: string;
    link: string;
}

export const leagueThemePalettes: Record<
    LeagueAccentColor,
    LeagueThemePalette
> = {
    amber: {
        banner: 'bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.22),_transparent_40%),linear-gradient(135deg,_#0f172a_0%,_#78350f_45%,_#d97706_100%)]',
        bannerRing: 'ring-amber-500/20',
        accentText: 'text-amber-300',
        darkAccent: 'text-amber-800',
        iconColor: 'text-amber-300',
        badgeBorder: 'border-amber-300/20',
        badgeBg: 'bg-amber-950/30',
        badgeText: 'text-amber-100',
        primaryButton: 'bg-amber-600 hover:bg-amber-500 text-white',
        secondaryButton:
            'border-amber-300/40 text-amber-50 hover:bg-amber-900/25',
        softBg: 'bg-amber-50',
        softBorder: 'border-amber-200',
        softText: 'text-amber-800',
        rankFirst: 'border-amber-300 bg-amber-500 text-white',
        currentUserHighlight: 'border-amber-200 bg-amber-50/70',
        buttonRing: 'ring-amber-600',
        inviteIcon: 'bg-amber-100 text-amber-700',
        link: 'text-amber-700 hover:text-amber-800',
    },
    blue: {
        banner: 'bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.18),_transparent_40%),linear-gradient(135deg,_#0f172a_0%,_#1e3a8a_45%,_#2563eb_100%)]',
        bannerRing: 'ring-blue-500/20',
        accentText: 'text-blue-300',
        darkAccent: 'text-blue-700',
        iconColor: 'text-blue-300',
        badgeBorder: 'border-blue-300/20',
        badgeBg: 'bg-blue-950/30',
        badgeText: 'text-blue-100',
        primaryButton: 'bg-blue-600 hover:bg-blue-500 text-white',
        secondaryButton: 'border-blue-300/40 text-blue-50 hover:bg-blue-900/25',
        softBg: 'bg-blue-50',
        softBorder: 'border-blue-200',
        softText: 'text-blue-800',
        rankFirst: 'border-blue-300 bg-blue-600 text-white',
        currentUserHighlight: 'border-blue-200 bg-blue-50/70',
        buttonRing: 'ring-blue-600',
        inviteIcon: 'bg-blue-100 text-blue-700',
        link: 'text-blue-700 hover:text-blue-800',
    },
    violet: {
        banner: 'bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.18),_transparent_40%),linear-gradient(135deg,_#0f172a_0%,_#4c1d95_45%,_#7c3aed_100%)]',
        bannerRing: 'ring-violet-500/20',
        accentText: 'text-violet-300',
        darkAccent: 'text-violet-700',
        iconColor: 'text-violet-300',
        badgeBorder: 'border-violet-300/20',
        badgeBg: 'bg-violet-950/30',
        badgeText: 'text-violet-100',
        primaryButton: 'bg-violet-600 hover:bg-violet-500 text-white',
        secondaryButton:
            'border-violet-300/40 text-violet-50 hover:bg-violet-900/25',
        softBg: 'bg-violet-50',
        softBorder: 'border-violet-200',
        softText: 'text-violet-800',
        rankFirst: 'border-violet-300 bg-violet-600 text-white',
        currentUserHighlight: 'border-violet-200 bg-violet-50/70',
        buttonRing: 'ring-violet-600',
        inviteIcon: 'bg-violet-100 text-violet-700',
        link: 'text-violet-700 hover:text-violet-800',
    },
    emerald: {
        banner: 'bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.18),_transparent_40%),linear-gradient(135deg,_#0f172a_0%,_#064e3b_45%,_#059669_100%)]',
        bannerRing: 'ring-emerald-500/20',
        accentText: 'text-emerald-300',
        darkAccent: 'text-emerald-700',
        iconColor: 'text-emerald-300',
        badgeBorder: 'border-emerald-300/20',
        badgeBg: 'bg-emerald-950/30',
        badgeText: 'text-emerald-100',
        primaryButton: 'bg-emerald-600 hover:bg-emerald-500 text-white',
        secondaryButton:
            'border-emerald-300/40 text-emerald-50 hover:bg-emerald-900/25',
        softBg: 'bg-emerald-50',
        softBorder: 'border-emerald-200',
        softText: 'text-emerald-800',
        rankFirst: 'border-emerald-300 bg-emerald-600 text-white',
        currentUserHighlight: 'border-emerald-200 bg-emerald-50/70',
        buttonRing: 'ring-emerald-600',
        inviteIcon: 'bg-emerald-100 text-emerald-700',
        link: 'text-emerald-700 hover:text-emerald-800',
    },
    rose: {
        banner: 'bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.18),_transparent_40%),linear-gradient(135deg,_#0f172a_0%,_#881337_45%,_#be123c_100%)]',
        bannerRing: 'ring-rose-500/20',
        accentText: 'text-rose-300',
        darkAccent: 'text-rose-800',
        iconColor: 'text-rose-300',
        badgeBorder: 'border-rose-300/20',
        badgeBg: 'bg-rose-950/30',
        badgeText: 'text-rose-100',
        primaryButton: 'bg-rose-700 hover:bg-rose-600 text-white',
        secondaryButton: 'border-rose-300/40 text-rose-50 hover:bg-rose-900/25',
        softBg: 'bg-rose-50',
        softBorder: 'border-rose-200',
        softText: 'text-rose-900',
        rankFirst: 'border-rose-300 bg-rose-700 text-white',
        currentUserHighlight: 'border-rose-200 bg-rose-50/70',
        buttonRing: 'ring-rose-700',
        inviteIcon: 'bg-rose-100 text-rose-800',
        link: 'text-rose-800 hover:text-rose-900',
    },
    cyan: {
        banner: 'bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.18),_transparent_40%),linear-gradient(135deg,_#0f172a_0%,_#042f2e_45%,_#0f766e_100%)]',
        bannerRing: 'ring-teal-500/20',
        accentText: 'text-teal-300',
        darkAccent: 'text-teal-800',
        iconColor: 'text-teal-300',
        badgeBorder: 'border-teal-300/20',
        badgeBg: 'bg-teal-950/30',
        badgeText: 'text-teal-100',
        primaryButton: 'bg-teal-700 hover:bg-teal-600 text-white',
        secondaryButton: 'border-teal-300/40 text-teal-50 hover:bg-teal-900/25',
        softBg: 'bg-teal-50',
        softBorder: 'border-teal-200',
        softText: 'text-teal-900',
        rankFirst: 'border-teal-300 bg-teal-700 text-white',
        currentUserHighlight: 'border-teal-200 bg-teal-50/70',
        buttonRing: 'ring-teal-700',
        inviteIcon: 'bg-teal-100 text-teal-800',
        link: 'text-teal-800 hover:text-teal-900',
    },
};

export const leagueThemeOptions = [
    {
        value: 'amber',
        title: 'Gold',
        subtitle: 'World Cup',
        description: 'Premium trophy feel.',
        previewClassName: leagueThemePalettes.amber.banner,
    },
    {
        value: 'blue',
        title: 'Royal Blue',
        subtitle: 'Classic',
        description: 'Clean matchday look.',
        previewClassName: leagueThemePalettes.blue.banner,
    },
    {
        value: 'violet',
        title: 'Purple',
        subtitle: 'Night',
        description: 'Bold night-match energy.',
        previewClassName: leagueThemePalettes.violet.banner,
    },
    {
        value: 'emerald',
        title: 'Emerald',
        subtitle: 'Pitch',
        description: 'Fresh football pitch tones.',
        previewClassName: leagueThemePalettes.emerald.banner,
    },
    {
        value: 'rose',
        title: 'Burgundy',
        subtitle: 'Rivalry',
        description: 'Intense rivalry styling.',
        previewClassName: leagueThemePalettes.rose.banner,
    },
    {
        value: 'cyan',
        title: 'Teal',
        subtitle: 'Stadium',
        description: 'Modern stadium contrast.',
        previewClassName: leagueThemePalettes.cyan.banner,
    },
] as const;

export function getLeagueThemePalette(
    accentColor: LeagueAccentColor | null | undefined,
): LeagueThemePalette {
    if (!accentColor) {
        return leagueThemePalettes[defaultAccentColor];
    }

    return (
        leagueThemePalettes[accentColor] ??
        leagueThemePalettes[defaultAccentColor]
    );
}

export function getLeagueThemeBannerClass(
    accentColor: LeagueAccentColor | null | undefined,
) {
    const palette = getLeagueThemePalette(accentColor);

    return cn(
        'relative overflow-hidden rounded-2xl text-white shadow-sm ring-1',
        palette.banner,
        palette.bannerRing,
    );
}
