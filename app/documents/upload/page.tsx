"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

const NAV_LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/documents/upload", label: "Upload" },
  { href: "/search", label: "Search" },
];

const CATEGORIES = [
  { value: "general", label: "General" },
  { value: "finance", label: "Finance" },
  { value: "hr", label: "HR" },
  { value: "legal", label: "Legal" },
  { value: "technical", label: "Technical" },
];

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("general");
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileSelect(selected: File | null) {
    if (selected) {
      setFile(selected);
      setError(null);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFileSelect(dropped);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    if (title.trim()) formData.append("title", title.trim());
    formData.append("category", category);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Upload failed. Please try again.");
        return;
      }

      router.push("/");
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
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
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                link.href === "/documents/upload"
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
        <header className="border-b border-zinc-200 px-8 py-6">
          <h1 className="text-2xl font-semibold text-zinc-900">
            Upload Document
          </h1>
        </header>

        <div className="flex-1 px-8 py-6">
          <form onSubmit={handleSubmit} className="mx-auto max-w-xl space-y-6">
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-12 transition-colors ${
                dragging
                  ? "border-zinc-900 bg-zinc-50"
                  : "border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"
                onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
              />
              {file ? (
                <>
                  <p className="text-sm font-medium text-zinc-900">
                    {file.name}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {(file.size / 1024).toFixed(1)} KB — click or drop to replace
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-zinc-900">
                    Drop your file here
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    or click to browse — PDF, DOCX, TXT, PNG, JPG (max 10MB)
                  </p>
                </>
              )}
            </div>

            <div>
              <label
                htmlFor="title"
                className="mb-1.5 block text-sm font-medium text-zinc-700"
              >
                Title{" "}
                <span className="font-normal text-zinc-400">(optional)</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Defaults to filename"
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="mb-1.5 block text-sm font-medium text-zinc-700"
              >
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={uploading || !file}
              className="w-full rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploading ? "Uploading…" : "Upload Document"}
            </button>

            {uploading && (
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200">
                <div className="h-full w-1/3 animate-pulse rounded-full bg-zinc-900" />
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}
