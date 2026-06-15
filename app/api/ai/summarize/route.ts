import { db } from "@/lib/db";
import type { Document } from "@/types";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const documentId = body.documentId as number | undefined;

  if (!documentId || !Number.isInteger(documentId) || documentId <= 0) {
    return NextResponse.json(
      { error: "documentId is required" },
      { status: 400 }
    );
  }

  const document = db
    .prepare("SELECT * FROM documents WHERE id = ?")
    .get(documentId) as Document | undefined;

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const summary = `This document titled '${document.title}' is categorized under '${document.category}'. AI summarization is available when connected to the Claude API.`;

  db.prepare(
    `UPDATE documents SET summary = ?, updated_at = datetime('now') WHERE id = ?`
  ).run(summary, documentId);

  return NextResponse.json({ summary });
}
