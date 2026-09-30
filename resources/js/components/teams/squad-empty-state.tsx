interface Props {
    message: string;
}

export default function SquadEmptyState({ message }: Props) {
    return (
        <div className="rounded-lg border border-dashed border-[#343d37] bg-[#0d110f] p-6 text-sm font-medium text-[#7f8882]">
            {message}
        </div>
    );
}
