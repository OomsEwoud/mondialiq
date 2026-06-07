import { Eye, EyeOff } from 'lucide-react';
import type { ComponentProps } from 'react';
import { forwardRef, useState } from 'react';

import { Input } from '@/components/ui/forms/input';
import { cn } from '@/lib/utils';

const passwordToggleButtonClass =
    'absolute inset-y-1 right-1 flex w-9 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900 focus-visible:bg-cyan-100 focus-visible:text-slate-900 focus-visible:ring-[3px] focus-visible:ring-cyan-200 focus-visible:outline-none active:bg-cyan-100 active:text-slate-900';

const PasswordInput = forwardRef<
    HTMLInputElement,
    Omit<ComponentProps<'input'>, 'type'>
>(function PasswordInput({ className, ...props }, ref) {
    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => {
        setShowPassword((previousValue) => !previousValue);
    };
    const ariaLabel = showPassword ? 'Hide password' : 'Show password';

    return (
        <div className="relative">
            <Input
                type={showPassword ? 'text' : 'password'}
                className={cn('pr-10', className)}
                ref={ref}
                {...props}
            />
            <button
                type="button"
                onClick={togglePasswordVisibility}
                className={passwordToggleButtonClass}
                aria-label={ariaLabel}
                aria-pressed={showPassword}
                tabIndex={-1}
            >
                {showPassword ? (
                    <EyeOff className="size-4" />
                ) : (
                    <Eye className="size-4" />
                )}
            </button>
        </div>
    );
});

export default PasswordInput;
