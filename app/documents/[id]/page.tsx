"use client";

import StatusBadge from "@/components/StatusBadge";
import type { Document } from "@/types";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const NAV_LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/documents/upload", label: "Upload" },
  { href: "/search", label: "Search" },
];

const STATUS_CYCLE: Record<string, string> = {
  draft: "review",
  review: "approved",
  approved: "draft",
};

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

function nextStatus(current: string): string {
  return STATUS_CYCLE[current.toLowerCase()] ?? "review";
}

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [summarizing, setSummarizing] = useState(false);

  const fetchDocument = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/documents/${id}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to load document");
        setDocument(null);
        return;
      }

      setDocument(data);
    } catch {
      setError("Failed to load document");
      setDocument(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDocument();
  }, [fetchDocument]);

  async function handleChangeStatus() {
    if (!document) return;

    setUpdating(true);
    const newStatus = nextStatus(document.status);

    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to update status");
        return;
      }

      setDocument(data);
    } catch {
      setError("Failed to update status");
    } finally {
      setUpdating(false);
    }
  }

  async function handleGenerateSummary() {
    if (!document) return;

    setSummarizing(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: document.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to generate summary");
        return;
      }

      await fetchDocument();
    } catch {
      setError("Failed to generate summary");
    } finally {
      setSummarizing(false);
    }
  }

  async function handleDelete() {
    if (!document || !confirm("Delete this document? This cannot be undone.")) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to delete document");
        return;
      }

      router.push("/");
    } catch {
      setError("Failed to delete document");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 shrink-0 flex-col bg-zinc-900 px-4 py-6">
        <div className="mb-8 px-2 text-lg font-semibold text-white">
          DocFlow
        </div>
        <nav className="flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex flex-1 flex-col bg-white">
        <header className="border-b border-zinc-200 px-8 py-6">
          <Link
            href="/"
            className="mb-4 inline-block text-sm text-zinc-500 transition-colors hover:text-zinc-900"
          >
            ← Back to Dashboard
          </Link>
          {document && (
            <h1 className="text-2xl font-semibold text-zinc-900">
              {document.title}
            </h1>
          )}
        </header>

        <div className="flex-1 px-8 py-6">
          {loading ? (
            <p className="text-sm text-zinc-500">Loading document…</p>
          ) : error && !document ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : document ? (
            <div className="mx-auto max-w-2xl space-y-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium capitalize text-zinc-600">
                  {document.category}
                </span>
                <StatusBadge status={document.status} />
              </div>

              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-zinc-500">
                    File size
                  </dt>
                  <dd className="mt-1 text-sm text-zinc-900">
                    {formatFileSize(document.file_size)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-zinc-500">
                    Uploaded
                  </dt>
                  <dd className="mt-1 text-sm text-zinc-900">
                    {formatDate(document.uploaded_at)}
                  </dd>
                </div>
              </dl>

              <div>
                <h2 className="mb-2 text-sm font-medium text-zinc-500">
                  Summary
                </h2>
                <div className="flex flex-wrap items-start gap-3">
                  <p className="text-sm leading-relaxed text-zinc-900">
                    {document.summary ?? "No summary yet"}
                  </p>
                  {!document.summary && (
                    <button
                      type="button"
                      onClick={handleGenerateSummary}
                      disabled={summarizing || updating || deleting}
                      className="shrink-0 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {summarizing ? "Generating…" : "Generate Summary"}
                    </button>
                  )}
                </div>
              </div>

              {error && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                  {error}
                </p>
              )}

              <div className="flex flex-wrap gap-3 border-t border-zinc-200 pt-6">
                <button
                  type="button"
                  onClick={handleChangeStatus}
                  disabled={updating || deleting || summarizing}
                  className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {updating ? "Updating…" : "Change Status"}
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={updating || deleting || summarizing}
                  className="rounded-md border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deleting ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
