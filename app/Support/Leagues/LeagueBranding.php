<?php

namespace App\Support\Leagues;

class LeagueBranding
{
    public const DEFAULT_ICON = '🏆';
    public const DEFAULT_ACCENT_COLOR = 'cyan';
    public const DEFAULT_COVER_STYLE = 'stadium';

    /**
     * @return array<int, string>
     */
    public static function icons(): array
    {
        return ['🏆', '🔥', '🌍', '⚡', '⭐', '🎯'];
    }

    /**
     * @return array<int, string>
     */
    public static function accentColors(): array
    {
        return ['cyan', 'emerald', 'amber', 'rose', 'violet', 'blue'];
    }

    /**
     * @return array<int, string>
     */
    public static function coverStyles(): array
    {
        return ['stadium', 'spotlight', 'pitch', 'night'];
    }
}
