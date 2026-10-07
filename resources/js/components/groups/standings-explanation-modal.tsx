import { CircleHelp, Trophy, XIcon } from 'lucide-react';
import type * as React from 'react';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/overlays/dialog';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const pointsRules = [
    {
        label: 'Win',
        points: '+3 pts',
        description: 'Three points for a victory.',
    },
    {
        label: 'Draw',
        points: '+1 pt',
        description: 'One point for each team.',
    },
    {
        label: 'Loss',
        points: '+0 pts',
        description: 'No points for a defeat.',
    },
];

const tableColumns = [
    ['P', 'Played matches'],
    ['W', 'Wins'],
    ['D', 'Draws'],
    ['L', 'Losses'],
    ['GD', 'Goal difference'],
    ['PTS', 'Points'],
] as const;

export default function StandingsExplanationModal({
    open,
    onOpenChange,
}: Props) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                hideCloseButton
                className="shadow-black/20/60 max-h-[85vh] overflow-y-auto rounded-3xl border border-border bg-card p-0 shadow-xl sm:max-w-4xl"
            >
                <DialogClose className="absolute top-5 right-5 z-10 flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
                    <XIcon className="size-5" />
                    <span className="sr-only">Close</span>
                </DialogClose>

                <div className="border-b border-border bg-gradient-to-b from-card to-card/70 px-6 py-8 sm:px-8 sm:py-10">
                    <DialogHeader className="gap-3 text-left">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                            <div className="min-w-0">
                                <div className="flex size-14 items-center justify-center rounded-2xl bg-accent text-primary shadow-sm ring-1 ring-border">
                                    <Trophy className="size-6" />
                                </div>
                                <p className="mt-4 text-xs font-bold tracking-wide text-primary uppercase">
                                    Group Standings
                                </p>
                                <DialogTitle className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                                    How standings work
                                </DialogTitle>
                                <DialogDescription className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                                    An overview of how to read the standings
                                    table and its points system.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                </div>

                <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
                    <SectionCard
                        icon={<Trophy className="size-5" />}
                        eyebrow="Points"
                        title="Points system"
                    >
                        <p className="text-sm leading-6 text-muted-foreground">
                            Teams earn points from their competition matches.
                        </p>
                        <div className="mt-5 grid gap-3 sm:grid-cols-3">
                            {pointsRules.map((rule) => (
                                <div
                                    key={rule.label}
                                    className="rounded-2xl border border-border bg-gradient-to-b from-card to-card/60 p-4 shadow-sm"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <h3 className="text-lg font-bold text-foreground">
                                            {rule.label}
                                        </h3>
                                        <span className="rounded-full border border-border bg-accent px-3 py-1 text-xs font-bold text-primary">
                                            {rule.points}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                        {rule.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </SectionCard>

                    <SectionCard
                        icon={<CircleHelp className="size-5" />}
                        eyebrow="Columns"
                        title="Table columns"
                    >
                        <p className="text-sm leading-6 text-muted-foreground">
                            These short labels help you read the table quickly.
                        </p>
                        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {tableColumns.map(([code, meaning]) => (
                                <div
                                    key={code}
                                    className="rounded-2xl border border-border bg-gradient-to-b from-card to-card/60 p-4 shadow-sm"
                                >
                                    <p className="text-2xl font-bold text-foreground">
                                        {code}
                                    </p>
                                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                        {meaning}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </SectionCard>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function SectionCard({
    icon,
    eyebrow,
    title,
    children,
}: {
    icon: React.ReactNode;
    eyebrow: string;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-start gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent text-primary ring-1 ring-border">
                    {icon}
                </span>
                <div className="min-w-0">
                    <p className="text-xs font-bold tracking-wide text-primary uppercase">
                        {eyebrow}
                    </p>
                    <h2 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">
                        {title}
                    </h2>
                    <div className="mt-2">{children}</div>
                </div>
            </div>
        </section>
    );
}
