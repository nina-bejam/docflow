# DocFlow

A document management system for uploading, organizing, and reviewing files with AI-powered summaries.

## Tech Stack

- Next.js 15
- TypeScript
- SQLite (better-sqlite3)
- Claude AI (Anthropic)
- Tailwind CSS

## Features

- Document upload (PDF, DOCX, TXT, PNG, JPG)
- Categorization (general, finance, HR, legal, technical)
- Status workflow: Draft → Review → Approved
- AI summarization
- Version history

## Getting Started

```bash
git clone <repo-url>
cd docflow
npm install
```

Create a `.env.local` file in the project root:

```
ANTHROPIC_API_KEY=your-api-key-here
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

AI summarization requires an Anthropic API key. Without a valid key, summary generation will not connect to Claude.
