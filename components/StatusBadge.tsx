const STATUS_STYLES: Record<string, string> = {
  draft: "bg-zinc-100 text-zinc-600",
  review: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
};

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = status.toLowerCase();
  const styles = STATUS_STYLES[normalized] ?? STATUS_STYLES.draft;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${styles}`}
    >
      {status}
    </span>
  );
}
