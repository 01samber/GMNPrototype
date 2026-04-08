# GMN ML Studio — Operations ML Tutorial (React + Vite)

Premium, **static-only** learning platform that teaches machine learning end-to-end using **GMN Completed 2026**-style operational workbooks. Parsing, cleaning, charts, and models run **entirely in the browser** (no backend).

## Quick start

```bash
cd GMNMLSAMPLE
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

### Sample dataset

Place `GMN Completed 2026.xlsx` in `public/` as `gmn-completed-2026.xlsx` (already included if you copied it during setup), or use **Dataset explorer → Load bundled sample** after `npm run dev`.

## Stack

- React 19 + Vite 8 + TypeScript
- Tailwind CSS v4 (`@tailwindcss/vite`)
- shadcn-style UI (Radix primitives + `class-variance-authority`)
- Framer Motion, Recharts, SheetJS (`xlsx`), Zustand, React Router, Sonner toasts
- Client-side ML: ridge linear regression, k-NN, decision tree, random forest (`ml-matrix` for ridge solve)

## GitHub Pages (static)

1. Set `base` in `vite.config.ts` to your repo name if you use **project pages**:
   - `base: '/YOUR_REPO_NAME/'`
   - For **user/org site** (`username.github.io`) use `base: '/'`.
2. Build:

```bash
npm run build
```

3. Deploy the `dist/` folder (GitHub Actions, `gh-pages` branch, or Netlify Drop).

Because `base` is currently `./`, relative hosting (Netlify / many static hosts) works without extra changes. For GitHub Pages project sites, switch to `'/repo/'` as above.

## Project structure (high level)

- `src/lib/excel/` — parsing, normalization, cleaning, quality scoring  
- `src/lib/ml/` — metrics, feature matrix, models, training pipeline  
- `src/lib/kpi/` — executive KPI helpers  
- `src/pages/` — routes (tutorial, explorer, EDA, models, KPI, …)  
- `src/content/chapters.ts` — curriculum copy  
- `src/store/` — dataset + UI state (persisted lightly)  

## Scripts

- `npm run dev` — local dev  
- `npm run build` — production bundle  
- `npm run preview` — preview `dist/`  

## Notes

- **Quarter sheets** `Q1`–`Q4` (handles names like `Q1 ` with trailing spaces) are ingested; sparse tabs are supported with warnings.
- **Target leakage** guards: when predicting `Cost`, the feature builder omits `cost / NTE approved`; similar rules apply for other targets.
- For production ML systems, add monitoring, data contracts, and server-side governance — this app is intentionally educational.
