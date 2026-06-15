import { db } from "@/lib/db";
import type { Document } from "@/types";
import { NextResponse } from "next/server";

export async function GET() {
  const documents = db
    .prepare("SELECT * FROM documents ORDER BY uploaded_at DESC")
    .all() as Document[];

  return NextResponse.json(documents);
}
