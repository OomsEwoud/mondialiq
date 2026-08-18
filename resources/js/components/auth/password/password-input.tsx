import { Eye, EyeOff } from 'lucide-react';
import type { ComponentProps } from 'react';
import { forwardRef, useState } from 'react';

import { Input } from '@/components/ui/forms/input';
import { cn } from '@/lib/utils';

const passwordToggleButtonClass =
    'absolute inset-y-1 right-1 flex w-10 items-center justify-center rounded-lg text-[#68706b] transition-colors hover:bg-[#202622] hover:text-white focus-visible:bg-[#202622] focus-visible:text-white focus-visible:ring-2 focus-visible:ring-[#36a96b]/30 focus-visible:outline-none active:bg-[#252c28]';

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
