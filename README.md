# Madplan

Dansk madplanlægger med bibliotek, ugeplan, dagsplan, random-generator og eksport til Word, Excel og PDF. Hostes gratis.

## Kør lokalt

```bash
cd meal-planner
npm install
cp .env.example .env
# Udfyld VITE_SUPABASE_URL og VITE_SUPABASE_ANON_KEY (valgfrit - uden disse kører appen i "Lokal tilstand" med localStorage)
npm run dev
```

Åbn `http://localhost:5173`.

## To tilstande

Appen understøtter to lagringstilstande — samme UI, samme features:

1. **Lokal tilstand** (default hvis ingen Supabase env-vars er sat).
   Data gemmes i browserens `localStorage`. Single-device, intet login. Perfekt til at prøve appen.

2. **Cloud-tilstand** (anbefalet).
   Data gemmes i Supabase (gratis Postgres). Magic-link login (email). Cross-device.

## Opsæt Supabase (gratis for evigt)

1. Opret konto på https://supabase.com (gratis, login med GitHub).
2. **New project** → vælg navn + password → region: Frankfurt.
3. Når projektet er oprettet:
   - Gå til **SQL Editor → New query**.
   - Indsæt indholdet af [`supabase/schema.sql`](supabase/schema.sql) og kør.
   - Gå til **Project Settings → API** og kopier:
     - Project URL → `VITE_SUPABASE_URL`
     - `anon` `public` key → `VITE_SUPABASE_ANON_KEY`
4. Sæt disse i `.env` (lokalt) og i Render (deployment).

Tabellerne beskyttes af Row Level Security — hver bruger ser kun sine egne måltider og planer.

## Deploy til Render (gratis static site)

1. Opret et GitHub-repo og push koden.
2. På https://render.com: **New → Static Site** → vælg repoet.
3. Build command: `npm install && npm run build`
4. Publish directory: `dist`
5. **Environment**: tilføj `VITE_SUPABASE_URL` og `VITE_SUPABASE_ANON_KEY`.
6. I Supabase **Authentication → URL Configuration** tilføj din Render-URL i *Site URL* og *Additional Redirect URLs* — ellers virker magic-link ikke.
7. Deploy. Du får en URL `https://<navn>.onrender.com`. Ingen spin-down. Ingen udløb.

## Funktioner

- **Bibliotek**: CRUD på måltider. Kategori (morgenmad / snack / frokost / aftensmad) + frie tags (kylling, oksekød, laks, vegetar…).
- **Filter & søgning**: tekst + kategori + multi-select tags. Find hurtigt måltider med det du har i køleskabet.
- **Ugeplan**: 7 dage × 7 slots tabel der matcher din originale Word-tabel. Klik en celle → vælg fra biblioteket.
- **Dagsplan**: mobilvenlig visning af én dag.
- **Random uge / random dag**: fyld tomme slots fra biblioteket. Undgår gentagelser på tværs af dagen (og hovedmåltider på tværs af ugen).
- **Eksport**: Word (.docx), Excel (.xlsx), PDF — genereres i browseren, ingen server nødvendig.
- **Seed**: første gang du logger ind, fyldes biblioteket med ~26 måltider udtrukket fra din originale `plan (1).docx`.

## Projektstruktur

```
meal-planner/
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   ├── types.ts
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── auth.ts
│   │   ├── data.ts          # Supabase + localStorage abstraktion
│   │   ├── iso-week.ts
│   │   ├── random.ts
│   │   ├── seed.ts
│   │   └── export/
│   │       ├── exportDocx.ts
│   │       ├── exportXlsx.ts
│   │       └── exportPdf.ts
│   ├── components/
│   │   ├── Modal.tsx
│   │   ├── TagSelector.tsx
│   │   ├── MealForm.tsx
│   │   ├── MealPicker.tsx
│   │   └── WeekTable.tsx
│   └── pages/
│       ├── Login.tsx
│       ├── Library.tsx
│       ├── WeekPlan.tsx
│       └── DayPlan.tsx
├── supabase/schema.sql
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```
