import { Gift } from 'lucide-react';
import InputError from '@/components/forms/input-error';
import { Input } from '@/components/ui/forms/input';
import { Label } from '@/components/ui/forms/label';
import { Textarea } from '@/components/ui/forms/textarea';
import { cn } from '@/lib/utils';
import type { LeagueThemePalette } from '@/utils/league-branding';

type Props = {
    rewardTitle: string;
    setRewardTitle: (val: string) => void;
    rewardDescription: string;
    setRewardDescription: (val: string) => void;
    errors: Record<string, string>;
    theme: LeagueThemePalette;
    fieldClassName: string;
};

export default function LeagueRewardSettings({
    rewardTitle,
    setRewardTitle,
    rewardDescription,
    setRewardDescription,
    errors,
    theme,
    fieldClassName,
}: Props) {
    return (
        <div
            className={cn(
                'rounded-2xl border p-5',
                theme.softBg,
                theme.softBorder,
            )}
        >
            <div className={cn('flex items-center gap-2', theme.darkAccent)}>
                <Gift className="size-4" />
                <p className="text-xs font-semibold tracking-wide uppercase">
                    Reward settings
                </p>
            </div>
            <p className={cn('mt-2 text-sm leading-6', theme.softText)}>
                Rewards are social notes only. MondialIQ does not process
                payments or payouts.
            </p>
            <div className="mt-4 space-y-4">
                <div>
                    <Label
                        htmlFor="reward-title"
                        className={cn(
                            'text-xs font-semibold tracking-wide uppercase',
                            theme.darkAccent,
                        )}
                    >
                        Reward title
                    </Label>
                    <Input
                        id="reward-title"
                        name="reward_title"
                        value={rewardTitle}
                        onChange={(event) => setRewardTitle(event.target.value)}
                        className={fieldClassName}
                        placeholder="Winner gets pizza"
                    />
                    <InputError message={errors.reward_title} />
                </div>
                <div>
                    <Label
                        htmlFor="reward-description"
                        className={cn(
                            'text-xs font-semibold tracking-wide uppercase',
                            theme.darkAccent,
                        )}
                    >
                        Reward details
                    </Label>
                    <Textarea
                        id="reward-description"
                        name="reward_description"
                        value={rewardDescription}
                        onChange={(event) =>
                            setRewardDescription(event.target.value)
                        }
                        className="min-h-20 rounded-xl border-slate-200 bg-white text-slate-900 shadow-none placeholder:text-slate-600 focus-visible:border-cyan-400 focus-visible:ring-cyan-200"
                        placeholder="Example: €20 gift card, paid outside MondialIQ."
                    />
                    <InputError message={errors.reward_description} />
                </div>
            </div>
        </div>
    );
}
