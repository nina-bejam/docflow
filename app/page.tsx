"use client";

import DocumentCard from "@/components/DocumentCard";
import type { Document } from "@/types";
import Link from "next/link";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/documents/upload", label: "Upload" },
  { href: "/search", label: "Search" },
];

export default function Home() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/documents")
      .then((res) => res.json())
      .then((data) => setDocuments(data))
      .finally(() => setLoading(false));
  }, []);

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
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                link.href === "/"
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex flex-1 flex-col bg-white">
        <header className="flex items-center justify-between border-b border-zinc-200 px-8 py-6">
          <h1 className="text-2xl font-semibold text-zinc-900">Dashboard</h1>
          <Link
            href="/documents/upload"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
          >
            Upload Document
          </Link>
        </header>

        <div className="flex-1 px-8 py-6">
          {loading ? (
            <p className="text-sm text-zinc-500">Loading documents…</p>
          ) : documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="mb-2 text-lg font-medium text-zinc-900">
                No documents yet
              </p>
              <p className="mb-6 text-sm text-zinc-500">
                Upload your first document to get started.
              </p>
              <Link
                href="/documents/upload"
                className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
              >
                Upload Document
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {documents.map((doc) => (
                <DocumentCard key={doc.id} document={doc} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
