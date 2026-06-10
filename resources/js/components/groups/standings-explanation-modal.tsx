import {
    CheckCircle2,
    CircleHelp,
    ListOrdered,
    ShieldCheck,
    Trophy,
    XIcon,
} from 'lucide-react';
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

const qualificationRules = [
    {
        label: 'Top 2',
        status: 'Qualified',
        description:
            'The first two teams in every group go through automatically.',
        tone: 'qualified',
    },
    {
        label: 'Best 3rd top 8',
        status: 'Qualified',
        description:
            'The best eight third-placed teams also reach the Round of 32.',
        tone: 'qualified',
    },
    {
        label: 'Others',
        status: 'Not qualified',
        description:
            'The remaining third-placed teams and all fourth-placed teams are eliminated.',
        tone: 'eliminated',
    },
] as const;

const thirdPlaceRanks = Array.from({ length: 12 }, (_, index) => index + 1);

export default function StandingsExplanationModal({
    open,
    onOpenChange,
}: Props) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                hideCloseButton
                className="max-h-[85vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-0 shadow-xl shadow-slate-200/60 sm:max-w-4xl"
            >
                <DialogClose className="absolute top-5 right-5 z-10 flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:outline-none">
                    <XIcon className="size-5" />
                    <span className="sr-only">Close</span>
                </DialogClose>

                <div className="border-b border-slate-100 bg-gradient-to-b from-white to-slate-50/70 px-6 py-8 sm:px-8 sm:py-10">
                    <DialogHeader className="gap-3 text-left">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                            <div className="min-w-0">
                                <div className="flex size-14 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600 shadow-sm ring-1 ring-slate-200">
                                    <Trophy className="size-6" />
                                </div>
                                <p className="mt-4 text-xs font-bold tracking-wide text-cyan-600 uppercase">
                                    Group Standings
                                </p>
                                <DialogTitle className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                                    How standings work
                                </DialogTitle>
                                <DialogDescription className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                                    A clear guide to points, table columns,
                                    qualification rules and third-place
                                    rankings.
                                </DialogDescription>
                            </div>

                            <div className="grid gap-2 sm:grid-cols-3 lg:max-w-sm lg:min-w-[18rem]">
                                <HeroStat label="Groups" value="12" />
                                <HeroStat label="Teams each" value="4" />
                                <HeroStat
                                    label="Advance"
                                    value="Top 2 + 8 best 3rd"
                                />
                            </div>
                        </div>
                    </DialogHeader>
                </div>

                <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
                    <SectionCard
                        icon={<ListOrdered className="size-5" />}
                        eyebrow="Group format"
                        title="How group standings work"
                    >
                        <p className="text-sm leading-6 text-slate-600 sm:text-base">
                            Each World Cup group contains four teams. Teams are
                            ranked by their match results during the group
                            stage.
                        </p>
                    </SectionCard>

                    <SectionCard
                        icon={<Trophy className="size-5" />}
                        eyebrow="Points"
                        title="Points system"
                    >
                        <p className="text-sm leading-6 text-slate-600">
                            Teams earn points from every group-stage match.
                        </p>
                        <div className="mt-5 grid gap-3 sm:grid-cols-3">
                            {pointsRules.map((rule) => (
                                <div
                                    key={rule.label}
                                    className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-4 shadow-sm"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <h3 className="text-lg font-bold text-slate-950">
                                            {rule.label}
                                        </h3>
                                        <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-700">
                                            {rule.points}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm leading-6 text-slate-600">
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
                        <p className="text-sm leading-6 text-slate-600">
                            These short labels help you read the table quickly.
                        </p>
                        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {tableColumns.map(([code, meaning]) => (
                                <div
                                    key={code}
                                    className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-4 shadow-sm"
                                >
                                    <p className="text-2xl font-bold text-slate-950">
                                        {code}
                                    </p>
                                    <p className="mt-1 text-sm leading-6 text-slate-600">
                                        {meaning}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </SectionCard>

                    <SectionCard
                        icon={<ShieldCheck className="size-5" />}
                        eyebrow="Qualification"
                        title="Qualification"
                    >
                        <p className="text-sm leading-6 text-slate-600">
                            Group position decides whether a team keeps going or
                            leaves the tournament.
                        </p>
                        <div className="mt-5 grid gap-3 lg:grid-cols-3">
                            {qualificationRules.map((rule) => (
                                <div
                                    key={rule.label}
                                    className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-4 shadow-sm"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-lg font-bold text-slate-950">
                                            {rule.label}
                                        </p>
                                        <span
                                            className={
                                                rule.tone === 'qualified'
                                                    ? 'rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800'
                                                    : 'rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700'
                                            }
                                        >
                                            {rule.status}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm leading-6 text-slate-600">
                                        {rule.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </SectionCard>

                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 bg-gradient-to-b from-white to-slate-50/60 p-6">
                            <div className="flex items-start gap-3">
                                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 ring-1 ring-slate-200">
                                    <CheckCircle2 className="size-5" />
                                </span>
                                <div>
                                    <p className="text-xs font-bold tracking-wide text-cyan-600 uppercase">
                                        Cross-group ranking
                                    </p>
                                    <h2 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">
                                        Best 3rd ranking
                                    </h2>
                                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                                        The Best 3rd ranking compares all teams
                                        that finish third in their group. The
                                        top eight in that ranking advance to the
                                        Round of 32.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                <p className="text-sm font-bold tracking-wide text-cyan-600 uppercase">
                                    Quick view
                                </p>
                                <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                                    <MiniInfoCard
                                        title="12 teams"
                                        body="Every group sends one third-placed team into this comparison."
                                    />
                                    <MiniInfoCard
                                        title="Top 8"
                                        body="Only the strongest eight continue into the knockout stage."
                                    />
                                    <MiniInfoCard
                                        title="Cutoff"
                                        body="Rank #8 is the last safe place in the table."
                                    />
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <p className="text-sm font-bold text-slate-950">
                                        12 third-placed teams
                                    </p>
                                    <p className="text-xs font-bold tracking-wide text-slate-400 uppercase">
                                        Top 8 advance
                                    </p>
                                </div>
                                <div className="grid gap-2">
                                    {thirdPlaceRanks.map((rank) => (
                                        <div key={rank}>
                                            <div
                                                className={
                                                    rank <= 8
                                                        ? 'flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800 shadow-sm'
                                                        : 'flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-600'
                                                }
                                            >
                                                <span>Rank #{rank}</span>
                                                <span>
                                                    {rank <= 8
                                                        ? 'Qualified'
                                                        : 'Eliminated'}
                                                </span>
                                            </div>
                                            {rank === 8 && (
                                                <div className="my-2 flex items-center gap-3 text-xs font-bold tracking-wide text-amber-600 uppercase">
                                                    <span className="h-px flex-1 bg-amber-200" />
                                                    <span>Cutoff line</span>
                                                    <span className="h-px flex-1 bg-amber-200" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
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
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600 ring-1 ring-slate-200">
                    {icon}
                </span>
                <div className="min-w-0">
                    <p className="text-xs font-bold tracking-wide text-cyan-600 uppercase">
                        {eyebrow}
                    </p>
                    <h2 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">
                        {title}
                    </h2>
                    <div className="mt-2">{children}</div>
                </div>
            </div>
        </section>
    );
}

function HeroStat({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm">
            <p className="text-xs font-bold tracking-wide text-slate-400 uppercase">
                {label}
            </p>
            <p className="mt-1 text-sm leading-5 font-bold text-slate-950">
                {value}
            </p>
        </div>
    );
}

function MiniInfoCard({ title, body }: { title: string; body: string }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-4 shadow-sm">
            <p className="text-sm font-bold text-slate-950">{title}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
        </div>
    );
}
