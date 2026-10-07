import { Link } from '@inertiajs/react';
import type * as React from 'react';
import { cn } from '@/lib/utils';

interface TabItem<Value extends string> {
    value: Value;
    label: string;
    sublabel?: string;
}

interface LinkTabsProps<Value extends string> {
    mode: 'links';
    ariaLabel: string;
    activeValue: Value;
    items: Array<TabItem<Value> & { href: string }>;
    className?: string;
}

interface ButtonTabsProps<Value extends string> {
    mode: 'tabs';
    ariaLabel: string;
    activeValue: Value;
    items: Array<TabItem<Value>>;
    panelId: string;
    onChange: (value: Value) => void;
    className?: string;
}

type Props<Value extends string> =
    | LinkTabsProps<Value>
    | ButtonTabsProps<Value>;

export default function SportsTabs<Value extends string>(props: Props<Value>) {
    const listClassName = cn(
        '-mx-4 mb-7 flex gap-5 overflow-x-auto border-b border-border-subtle px-4 sm:mx-0 sm:gap-7 sm:px-0',
        props.className,
    );

    if (props.mode === 'links') {
        return (
            <nav aria-label={props.ariaLabel} className={listClassName}>
                {props.items.map(({ value, label, sublabel, href }) => {
                    const isActive = props.activeValue === value;

                    return (
                        <Link
                            key={value}
                            href={href}
                            aria-current={isActive ? 'page' : undefined}
                            className={cn(
                                'relative inline-flex min-h-12 shrink-0 items-center border-b-2 px-1 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                                isActive
                                    ? 'border-primary font-semibold text-foreground'
                                    : 'border-transparent font-medium text-muted-foreground hover:text-foreground',
                            )}
                        >
                            {sublabel ? (
                                <span className="grid gap-0.5 text-left">
                                    <span className="font-semibold">
                                        {label}
                                    </span>
                                    <span className="hidden text-xs font-normal text-muted-foreground sm:block">
                                        {sublabel}
                                    </span>
                                </span>
                            ) : (
                                label
                            )}
                        </Link>
                    );
                })}
            </nav>
        );
    }

    const selectNextTab = (event: React.KeyboardEvent<HTMLButtonElement>) => {
        const currentIndex = props.items.findIndex(
            ({ value }) => value === props.activeValue,
        );
        const nextIndex =
            event.key === 'ArrowRight'
                ? (currentIndex + 1) % props.items.length
                : event.key === 'ArrowLeft'
                  ? (currentIndex + props.items.length - 1) % props.items.length
                  : event.key === 'Home'
                    ? 0
                    : event.key === 'End'
                      ? props.items.length - 1
                      : null;

        if (nextIndex === null) {
            return;
        }

        event.preventDefault();
        const nextTab = props.items[nextIndex];
        props.onChange(nextTab.value);
        document.getElementById(`sports-tab-${nextTab.value}`)?.focus();
    };

    return (
        <div
            role="tablist"
            aria-label={props.ariaLabel}
            className={listClassName}
        >
            {props.items.map(({ value, label }) => {
                const isActive = props.activeValue === value;

                return (
                    <button
                        key={value}
                        type="button"
                        role="tab"
                        id={`sports-tab-${value}`}
                        aria-controls={props.panelId}
                        aria-selected={isActive}
                        tabIndex={isActive ? 0 : -1}
                        onClick={() => props.onChange(value)}
                        onKeyDown={selectNextTab}
                        className={cn(
                            'relative inline-flex min-h-12 shrink-0 items-center border-b-2 px-1 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                            isActive
                                ? 'border-primary font-semibold text-foreground'
                                : 'border-transparent font-medium text-muted-foreground hover:text-foreground',
                        )}
                    >
                        {label}
                    </button>
                );
            })}
        </div>
    );
}
