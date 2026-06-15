import StatusBadge from "@/components/StatusBadge";
import type { Document } from "@/types";
import Link from "next/link";

function formatFileSize(bytes: number | null): string {
  if (bytes == null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface DocumentCardProps {
  document: Document;
}

export default function DocumentCard({ document }: DocumentCardProps) {
  return (
    <Link
      href={`/documents/${document.id}`}
      className="block rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <h3 className="mb-3 truncate text-base font-semibold text-zinc-900">
        {document.title}
      </h3>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium capitalize text-zinc-600">
          {document.category}
        </span>
        <StatusBadge status={document.status} />
      </div>

      <div className="flex items-center justify-between text-sm text-zinc-500">
        <span>{formatFileSize(document.file_size)}</span>
        <span>{formatDate(document.uploaded_at)}</span>
      </div>
    </Link>
  );
}
