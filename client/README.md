# ScribeHealth — Client

The React SPA for **ScribeHealth**: consultation recording, transcripts, SOAP
note review/editing, the patient directory, and PDF sign & export.

Built with React 18, TypeScript, Vite, and Tailwind CSS.

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
```

Requires `VITE_API_BASE_URL` pointing at the API (e.g.
`http://localhost:3000/api/v1`).

## Commands

| Command           | Description                                  |
| ----------------- | -------------------------------------------- |
| `npm run dev`     | Start the Vite dev server with HMR.          |
| `npm run build`   | Type-check (`tsc -b`) and build for release. |
| `npm run preview` | Preview the production build locally.        |
| `npm run lint`    | Run ESLint.                                  |

---

Full project documentation — setup, environment variables, API reference, and
architecture — lives in the [root README](../README.md).
