import { Layers } from 'lucide-react';
import InputError from '@/components/forms/input-error';
import { Input } from '@/components/ui/forms/input';
import { Label } from '@/components/ui/forms/label';
import { Textarea } from '@/components/ui/forms/textarea';
import { cn } from '@/lib/utils';
import type { LeagueThemePalette } from '@/utils/league-branding';

type Props = {
    name: string;
    setName: (val: string) => void;
    description: string;
    setDescription: (val: string) => void;
    errors: Record<string, string>;
    theme: LeagueThemePalette;
    fieldClassName: string;
};

export default function LeagueBrandingSettings({
    name,
    setName,
    description,
    setDescription,
    errors,
    theme,
    fieldClassName,
}: Props) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className={cn('flex items-center gap-2', theme.darkAccent)}>
                <Layers className="size-4" />
                <p className="text-xs font-semibold tracking-wide uppercase">
                    Group profile
                </p>
            </div>
            <div className="mt-4 space-y-4">
                <div>
                    <Label
                        htmlFor="league-name"
                        className={cn(
                            'text-xs font-semibold tracking-wide uppercase',
                            theme.darkAccent,
                        )}
                    >
                        Group name
                    </Label>
                    <Input
                        id="league-name"
                        name="name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        className={fieldClassName}
                        placeholder="Your prediction group"
                    />
                    <p className="mt-1 text-xs text-slate-600">
                        Give the group a name that members recognise instantly.
                    </p>
                    <div className="min-h-5">
                        <InputError message={errors.name} />
                    </div>
                </div>
                <div>
                    <Label
                        htmlFor="group-description"
                        className={cn(
                            'text-xs font-semibold tracking-wide uppercase',
                            theme.darkAccent,
                        )}
                    >
                        Description
                    </Label>
                    <Textarea
                        id="group-description"
                        name="description"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        className="min-h-20 rounded-xl border-slate-200 bg-white text-slate-900 shadow-none placeholder:text-slate-600 focus-visible:border-cyan-400 focus-visible:ring-cyan-200"
                        placeholder="What is this prediction group about?"
                    />
                    <p className="mt-1 text-xs leading-5 text-slate-600">
                        Short context for members. Keep it simple: classmates,
                        work crew, family group, or matchday challenge.
                    </p>
                    <div className="min-h-5">
                        <InputError message={errors.description} />
                    </div>
                </div>
            </div>
        </div>
    );
}
