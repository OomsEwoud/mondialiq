<?php

namespace App\Support\Leagues;

class LeagueBranding
{
    public const DEFAULT_ICON = '🏆';

    public const DEFAULT_ACCENT_COLOR = 'amber';

    public static function icons(): array
    {
        return ['🏆', '🔥', '🌍', '⚡', '⭐', '🎯'];
    }

    public static function accentColors(): array
    {
        return ['cyan', 'emerald', 'amber', 'rose', 'violet', 'blue'];
    }
}
