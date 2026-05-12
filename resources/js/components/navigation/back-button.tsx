import { router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { matches } from '@/routes';

export default function BackButton() {
    const goBack = () => {
        if (window.history.length > 1) {
            window.history.back();

            return;
        }

        router.visit(matches.url());
    };

    return (
        <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-2 rounded-md border border-transparent px-2 py-1 text-sm font-bold text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-800 focus:ring-2 focus:ring-blue-200 focus:outline-none"
        >
            <ArrowLeft className="h-4 w-4" />
            Back
        </button>
    );
}
