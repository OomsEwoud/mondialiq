import { Eye, EyeOff } from 'lucide-react';
import type { ComponentProps } from 'react';
import { forwardRef, useState } from 'react';

import { Input } from '@/components/ui/forms/input';
import { cn } from '@/lib/utils';

const passwordToggleButtonClass =
    'absolute inset-y-1 right-1 flex w-10 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-interactive hover:text-foreground focus-visible:bg-surface-interactive focus-visible:text-foreground focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none active:bg-surface-interactive';

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
