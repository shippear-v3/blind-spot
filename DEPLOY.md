# Deploy plan (Vercel)

On Vercel the function filesystem is read-only. A photo saved in one request is invisible to the next request and to the other person. Production needs Neon (rows) and Blob (JPEGs), plus the Anthropic key.

Do this in order. The public URL can go up before the agents work; freeze code only when the four demo questions and one live upload work on a phone.

## 1. GitHub

Create the repo and push `main`. Do not push `.env`, `.env.local`, or `.data/`. `.env.example` is safe.

## 2. Vercel project

1. [vercel.com](https://vercel.com) → Add New → import the repo.
2. Framework: Next.js. Leave the build command as `next build`.
3. Deploy once. The investor screens should open. Chat and upload will fail until step 5.

## 3. Neon

1. Vercel dashboard → the project → Storage → Create Database → Neon (or neon.tech and paste the URL).
2. Copy the pooled `DATABASE_URL`.
3. You do not run a migration by hand. The first `listarObservaciones` / `guardarObservacion` creates the `observaciones` table if it is missing.
4. Seeded hitos and the eight demo observations stay in the repo. Neon only stores uploads.

## 4. Blob

1. Same Storage page → Blob → Create.
2. Copy `BLOB_READ_WRITE_TOKEN`.
3. Uploads go to `obra/AAAA-MM-DD.jpg` (public URL). A second photo on the same date overwrites.

## 5. Environment variables

Project → Settings → Environment Variables. Set all three on **Production** and **Preview**:

| Name | From | If missing |
|---|---|---|
| `ANTHROPIC_API_KEY` | console.anthropic.com | Chat and analyze return 500 |
| `DATABASE_URL` | Neon | Upload throws “Falta DATABASE_URL para guardar en Vercel.” |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob | Upload throws “Falta BLOB_READ_WRITE_TOKEN para guardar la foto.” |

Redeploy after saving. A preview deploy from the PR is enough to test; promote that deploy or wait for the next push to `main`.

## 6. Phone check (before 14:00)

On the public URL, not localhost:

1. Open `/` on a phone. Timeline shows floor 6 vencido sin evidencia.
2. `/chat` → the four suggested questions. Each reply cites a photo date.
3. `/cargar` → upload a photo under 4.5 MB. Wait for the observation.
4. Reload `/`. The new date is on the camera.
5. Ask “¿Cómo viene la obra?” again. The new date can appear in the answer.

If upload works and the investor still does not see the photo, the env vars are on Preview but not Production (or the other way around).

## 7. After it works

- Confirm the key is only in Vercel, not in the repo.
- Constructor URL for the pitch: `https://<project>.vercel.app/cargar`.
- Investor URL: `https://<project>.vercel.app`.
- `/cargar` has no password. Do not put it in the investor nav; it is in the footer.

## Out of scope for this deploy

Login, a real camera feed, scraping, payments. One obra (Edificio Ejemplo). The constructor does not edit the boleto.
