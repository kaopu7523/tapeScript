# TapeScript

Turn videos, audio files and links (YouTube, TikTok and more) into editable, exportable transcripts with AI summaries.

Website: https://tapescript.app

> **Status: paused (2026-10-28).** Fixed monthly costs (commercial hosting plus a VPS for link transcription, about ¥160–290/month) were too high for a first project. See the status note and cost breakdown in `docs/开发方案.md`.

## Development

```bash
pnpm install
cp .env.example .env   # fill in the values
pnpm db:migrate
pnpm dev
```

See `CLAUDE.md` for the project map and `docs/` for the product plan.

Built on top of the xiaopanstarter template (MIT, see `LICENSE`).
