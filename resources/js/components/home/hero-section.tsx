export default function HeroSection() {
    return (
        <div className="relative mb-8 rounded-2xl bg-white p-8 text-center">
            <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r from-red-500 via-blue-700 via-purple-600 to-teal-400 p-[2px]" />
            <div className="absolute inset-[2px] -z-10 rounded-2xl bg-white" />

            <p className="mb-1 text-xs tracking-widest text-slate-400 uppercase">
                World Cup
            </p>
            <h1 className="mb-2 bg-gradient-to-r from-red-500 via-blue-700 via-purple-600 to-teal-400 bg-clip-text text-8xl font-bold text-transparent">
                2026
            </h1>
            <p className="mx-auto mb-6 max-w-md text-sm text-slate-500">
                Track all matches, explore AI-powered predictions and compete
                with other fans on the leaderboard.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    104 matches
                </span>
                <span className="text-slate-300">·</span>
                <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-600" />
                    48 teams
                </span>
                <span className="text-slate-300">·</span>
                <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-teal-400" />
                    June 11 – July 19
                </span>
            </div>
        </div>
    );
}
