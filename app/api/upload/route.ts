import { db, syncFTS } from "@/lib/db";
import type { Document } from "@/types";
import fs from "fs";
import { NextResponse } from "next/server";
import path from "path";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "image/png",
  "image/jpeg",
]);

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File exceeds maximum size of 10MB" },
      { status: 400 }
    );
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "File type not allowed" },
      { status: 400 }
    );
  }

  const title =
    (formData.get("title") as string | null)?.trim() ||
    path.parse(file.name).name;
  const category =
    (formData.get("category") as string | null)?.trim() || "general";

  const ext = path.extname(file.name);
  const filename = `${Date.now()}${ext}`;
  const filepath = path.join(UPLOADS_DIR, filename);

  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(filepath, buffer);

  const relativePath = path.join("uploads", filename);

  const result = db
    .prepare(
      `INSERT INTO documents (title, filename, filepath, category, file_size, mime_type)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(title, filename, relativePath, category, file.size, file.type);

  const id = Number(result.lastInsertRowid);
  syncFTS(id);

  const document = db
    .prepare("SELECT * FROM documents WHERE id = ?")
    .get(id) as Document;

  return NextResponse.json(document, { status: 201 });
}
