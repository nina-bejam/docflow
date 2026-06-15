import { db } from "@/lib/db";
import type { Document } from "@/types";
import fs from "fs";
import { NextResponse } from "next/server";
import path from "path";

type RouteParams = { params: Promise<{ id: string }> };

function getDocument(id: string): Document | undefined {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    return undefined;
  }

  return db
    .prepare("SELECT * FROM documents WHERE id = ?")
    .get(numericId) as Document | undefined;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const document = getDocument(id);

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  return NextResponse.json(document);
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const document = getDocument(id);

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const body = await request.json();
  const status = body.status as string | undefined;

  const allowedStatuses = ["draft", "review", "approved"];
  if (!status || !allowedStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  db.prepare(
    `UPDATE documents SET status = ?, updated_at = datetime('now') WHERE id = ?`
  ).run(status, document.id);

  const updated = db
    .prepare("SELECT * FROM documents WHERE id = ?")
    .get(document.id) as Document;

  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const document = getDocument(id);

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const filePath = path.join(process.cwd(), document.filepath);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  db.prepare("DELETE FROM documents WHERE id = ?").run(document.id);

  return NextResponse.json({ success: true });
}
