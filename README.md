# Edificio Ejemplo

Agente de seguimiento de una inversión en pozo. La constructora carga la foto del día. El inversor ve la cámara, el cronograma del boleto y pregunta cómo viene la obra.

La obra, la constructora y las direcciones son ficticias. El estado de cada hito lo calcula una regla, no el modelo. No es asesoramiento legal ni financiero.

Local setup: [LOCAL.md](LOCAL.md). Vercel: [DEPLOY.md](DEPLOY.md).

## Correr

```bash
npm install
cp .env.example .env.local
# cargar ANTHROPIC_API_KEY
npm run dev
```

- Inversor: http://localhost:3000
- Constructora: http://localhost:3000/cargar

Sin Neon ni Blob, las fotos nuevas se guardan en `public/obra` y `.data/observaciones.json`.

## Regenerar observaciones

Poner 8 a 12 fotos `AAAA-MM-DD.jpg` en `public/obra` y correr:

```bash
npx tsx --env-file=.env.local scripts/analizar-fotos.ts
```

Revisar `data/observaciones.json` a mano si el modelo contó mal un piso.

## Stack

Next.js (App Router) · TypeScript · Tailwind · Claude (`claude-opus-5-5`) · Zod.

En Vercel: `ANTHROPIC_API_KEY`, `DATABASE_URL` (Neon) y `BLOB_READ_WRITE_TOKEN` (Vercel Blob). El inversor y la constructora leen las mismas observaciones.
