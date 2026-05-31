import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';
import type { VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { toggleVariants } from '@/components/ui/forms/toggle';
import { cn } from '@/lib/utils';

const ToggleGroupContext = React.createContext<VariantProps<typeof toggleVariants>>({
    size: 'default',
    variant: 'default',
});

type ToggleGroupProps = React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
    VariantProps<typeof toggleVariants>;

type ToggleGroupItemProps =
    React.ComponentProps<typeof ToggleGroupPrimitive.Item> &
    VariantProps<typeof toggleVariants>;

function ToggleGroup({
    className,
    variant,
    size,
    children,
    ...props
}: ToggleGroupProps) {
    return (
        <ToggleGroupPrimitive.Root
            data-slot="toggle-group"
            data-size={size}
            data-variant={variant}
            className={cn(
                'group/toggle-group flex items-center rounded-md data-[variant=outline]:shadow-xs',
                className,
            )}
            {...props}
        >
            <ToggleGroupContext.Provider value={{ variant, size }}>
                {children}
            </ToggleGroupContext.Provider>
        </ToggleGroupPrimitive.Root>
    );
}

function ToggleGroupItem({
    className,
    children,
    variant,
    size,
    ...props
}: ToggleGroupItemProps) {
    const context = React.useContext(ToggleGroupContext);
    const resolvedVariant = context.variant ?? variant;
    const resolvedSize = context.size ?? size;

    return (
        <ToggleGroupPrimitive.Item
            data-slot="toggle-group-item"
            data-size={resolvedSize}
            data-variant={resolvedVariant}
            className={cn(
                toggleVariants({
                    variant: resolvedVariant,
                    size: resolvedSize,
                }),
                'min-w-0 shrink-0 rounded-none shadow-none first:rounded-l-md last:rounded-r-md focus:z-10 focus-visible:z-10 data-[variant=outline]:border-l-0 data-[variant=outline]:first:border-l',
                className,
            )}
            {...props}
        >
            {children}
        </ToggleGroupPrimitive.Item>
    );
}

export { ToggleGroup, ToggleGroupItem };
