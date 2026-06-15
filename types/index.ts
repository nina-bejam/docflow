export interface Document {
  id: number;
  title: string;
  filename: string;
  filepath: string;
  category: string;
  status: string;
  summary: string | null;
  file_size: number | null;
  mime_type: string | null;
  uploaded_at: string;
  updated_at: string;
}

export interface DocumentVersion {
  id: number;
  document_id: number;
  version_number: number;
  filepath: string;
  note: string | null;
  created_at: string;
}
