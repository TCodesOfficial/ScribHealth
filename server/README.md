# ScribeHealth — Server

The NestJS REST API for **ScribeHealth**: authentication, the consultation
pipeline (transcription → structured SOAP note), patient management, and audio
storage.

Built with NestJS 12, Prisma 7, and PostgreSQL, with better-auth for sessions.

## Quick start

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev      # http://localhost:3000
```

Requires a `.env` file — see the
[environment variables table in the root README](../README.md#environment-variables).

## Commands

| Command              | Description                         |
| -------------------- | ----------------------------------- |
| `npm run dev`        | Start in watch mode.                |
| `npm run build`      | Compile to `dist/`.                 |
| `npm run start:prod` | Run the compiled build.             |
| `npm run lint`       | Run oxlint.                         |
| `npm run test`       | Run unit tests (Vitest).            |

---

Full project documentation — setup, environment variables, API reference, and
architecture — lives in the [root README](../README.md).
