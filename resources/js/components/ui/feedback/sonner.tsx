import { useFlashToast } from '@/hooks/use-flash-toast';
import { CircleCheck } from 'lucide-react';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

function Toaster({ ...props }: ToasterProps) {
    useFlashToast();

    return (
        <Sonner
            theme="light"
            className="toaster group"
            position="top-right"
            richColors
            icons={{
                success: (
                    <span className="flex size-6 items-center justify-center rounded-full bg-lime-100 text-green-800 ring-1 ring-white/70">
                        <CircleCheck className="size-4 stroke-[3]" />
                    </span>
                ),
            }}
            toastOptions={{
                classNames: {
                    toast: 'rounded-lg border shadow-lg',
                    success:
                        'border-green-700 bg-green-600 text-white shadow-xl shadow-green-950/30',
                    title: 'font-bold',
                    icon: 'size-6',
                },
            }}
            style={
                {
                    '--normal-bg': 'var(--popover)',
                    '--normal-text': 'var(--popover-foreground)',
                    '--normal-border': 'var(--border)',
                } as React.CSSProperties
            }
            {...props}
        />
    );
}

export { Toaster };
