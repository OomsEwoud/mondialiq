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
        banner: 'bg-card border-t-2 border-amber-500',
        bannerRing: 'ring-amber-500/20',
        accentText: 'text-amber-300',
        darkAccent: 'text-amber-200',
        iconColor: 'text-amber-300',
        badgeBorder: 'border-amber-300/20',
        badgeBg: 'bg-amber-950/30',
        badgeText: 'text-amber-100',
        primaryButton: 'bg-amber-400 hover:bg-amber-300 text-amber-950',
        secondaryButton:
            'border-amber-300/40 text-amber-50 hover:bg-amber-900/25',
        softBg: 'bg-amber-950/35',
        softBorder: 'border-amber-800/50',
        softText: 'text-amber-200',
        rankFirst: 'border-amber-300 bg-amber-500 text-amber-950',
        currentUserHighlight: 'border-amber-800/50 bg-amber-950/35',
        buttonRing: 'ring-amber-600',
        inviteIcon: 'bg-amber-950/50 text-amber-200',
        link: 'text-amber-200 hover:text-amber-200',
    },
    blue: {
        banner: 'bg-card border-t-2 border-blue-500',
        bannerRing: 'ring-blue-500/20',
        accentText: 'text-blue-300',
        darkAccent: 'text-blue-200',
        iconColor: 'text-blue-300',
        badgeBorder: 'border-blue-300/20',
        badgeBg: 'bg-blue-950/30',
        badgeText: 'text-blue-100',
        primaryButton: 'bg-blue-700 hover:bg-blue-600 text-white',
        secondaryButton: 'border-blue-300/40 text-blue-50 hover:bg-blue-900/25',
        softBg: 'bg-blue-950/35',
        softBorder: 'border-blue-800/50',
        softText: 'text-blue-200',
        rankFirst: 'border-blue-300 bg-blue-600 text-white',
        currentUserHighlight: 'border-blue-800/50 bg-blue-950/35',
        buttonRing: 'ring-blue-600',
        inviteIcon: 'bg-blue-950/50 text-blue-200',
        link: 'text-blue-200 hover:text-blue-200',
    },
    violet: {
        banner: 'bg-card border-t-2 border-violet-500',
        bannerRing: 'ring-violet-500/20',
        accentText: 'text-violet-300',
        darkAccent: 'text-violet-200',
        iconColor: 'text-violet-300',
        badgeBorder: 'border-violet-300/20',
        badgeBg: 'bg-violet-950/30',
        badgeText: 'text-violet-100',
        primaryButton: 'bg-violet-700 hover:bg-violet-600 text-white',
        secondaryButton:
            'border-violet-300/40 text-violet-50 hover:bg-violet-900/25',
        softBg: 'bg-violet-950/35',
        softBorder: 'border-violet-800/50',
        softText: 'text-violet-200',
        rankFirst: 'border-violet-300 bg-violet-600 text-white',
        currentUserHighlight: 'border-violet-800/50 bg-violet-950/35',
        buttonRing: 'ring-violet-600',
        inviteIcon: 'bg-violet-950/50 text-violet-200',
        link: 'text-violet-200 hover:text-violet-200',
    },
    emerald: {
        banner: 'bg-card border-t-2 border-emerald-500',
        bannerRing: 'ring-emerald-500/20',
        accentText: 'text-emerald-300',
        darkAccent: 'text-emerald-200',
        iconColor: 'text-emerald-300',
        badgeBorder: 'border-emerald-300/20',
        badgeBg: 'bg-emerald-950/30',
        badgeText: 'text-emerald-100',
        primaryButton: 'bg-emerald-700 hover:bg-emerald-800 text-white',
        secondaryButton:
            'border-emerald-300/40 text-emerald-50 hover:bg-emerald-900/25',
        softBg: 'bg-emerald-950/35',
        softBorder: 'border-emerald-800/50',
        softText: 'text-emerald-200',
        rankFirst: 'border-emerald-300 bg-emerald-600 text-white',
        currentUserHighlight: 'border-emerald-800/50 bg-emerald-950/35',
        buttonRing: 'ring-emerald-600',
        inviteIcon: 'bg-emerald-950/50 text-emerald-200',
        link: 'text-emerald-200 hover:text-emerald-200',
    },
    rose: {
        banner: 'bg-card border-t-2 border-rose-500',
        bannerRing: 'ring-rose-500/20',
        accentText: 'text-rose-300',
        darkAccent: 'text-rose-200',
        iconColor: 'text-rose-300',
        badgeBorder: 'border-rose-300/20',
        badgeBg: 'bg-rose-950/30',
        badgeText: 'text-rose-100',
        primaryButton: 'bg-rose-700 hover:bg-rose-600 text-white',
        secondaryButton: 'border-rose-300/40 text-rose-50 hover:bg-rose-900/25',
        softBg: 'bg-rose-950/35',
        softBorder: 'border-rose-800/50',
        softText: 'text-rose-200',
        rankFirst: 'border-rose-300 bg-rose-700 text-white',
        currentUserHighlight: 'border-rose-800/50 bg-rose-950/35',
        buttonRing: 'ring-rose-700',
        inviteIcon: 'bg-rose-950/50 text-rose-200',
        link: 'text-rose-200 hover:text-rose-200',
    },
    cyan: {
        banner: 'bg-card border-t-2 border-teal-500',
        bannerRing: 'ring-teal-500/20',
        accentText: 'text-teal-300',
        darkAccent: 'text-teal-200',
        iconColor: 'text-teal-300',
        badgeBorder: 'border-teal-300/20',
        badgeBg: 'bg-teal-950/30',
        badgeText: 'text-teal-100',
        primaryButton: 'bg-teal-700 hover:bg-teal-800 text-white',
        secondaryButton: 'border-teal-300/40 text-teal-50 hover:bg-teal-900/25',
        softBg: 'bg-teal-950/35',
        softBorder: 'border-teal-800/50',
        softText: 'text-teal-200',
        rankFirst: 'border-teal-300 bg-teal-700 text-white',
        currentUserHighlight: 'border-teal-800/50 bg-teal-950/35',
        buttonRing: 'ring-teal-700',
        inviteIcon: 'bg-teal-950/50 text-teal-200',
        link: 'text-teal-200 hover:text-teal-200',
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
