# Agent Context - Mythos Quest Development

## Prosjektoversikt

**Mythos Quest** (tidligere "Shadows of the 1920s") er et roguelite brettspill inspirert av Hero Quest og Mansions of Madness, satt i et Lovecraft-univers fra 1920-tallet.

## Teknisk Stack

- **Frontend**: React 18 + TypeScript
- **Bundler**: Vite 5
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: React hooks + Context
- **Routing**: React Router v6

## Utviklingsplattformer

### Lovable (lovable.dev)
- Primær utviklingsplattform for UI/UX-endringer
- Har visuell editor og live preview
- Automatisk deployment til lovable.dev subdomain
- Base path: `/` (root)

### Claude Code
- Brukes for kompleks logikk, refaktorering, og debugging
- Har tilgang til full kodebase
- Kan kjøre tester og build
- Base path: konfigurerbar via VITE_BASE_PATH

### GitHub Pages
- Produksjons-hosting
- URL: https://tombonator3000.github.io/connect-play/
- Base path: `/connect-play/`
- Automatisk deployment via GitHub Actions

## Synkron Utvikling

For å holde Lovable og Claude synkrone:

1. **Alltid pull før endringer**: Hent siste endringer fra GitHub
2. **Push etter endringer**: Commit og push til hovedbranch
3. **Lovable synker automatisk**: Lovable watcher oppdaterer fra GitHub
4. **Unngå konflikter**: Ikke rediger samme fil samtidig i begge verktøy

### Typisk arbeidsflyt

```
[Lovable] UI-endringer → Push til GitHub
                              ↓
[GitHub] Repository oppdatert
                              ↓
[Claude] Pull → Logikk-endringer → Push
                              ↓
[Lovable] Auto-sync fra GitHub
```

## Viktige Filer

| Fil | Beskrivelse |
|-----|-------------|
| `game_design_bible.md` | Komplett spilldesign-dokumentasjon |
| `REGELBOK.MD` | Spillregler (Hero Quest-stil) |
| `log.md` | Utviklingslogg - LOGG ALT HER |
| `agents.md` | Denne filen - kontekst for AI-agenter |

## Spillkode Struktur

```
src/
├── game/
│   ├── components/     # Spillkomponenter (GameBoard, HexTile, etc.)
│   ├── data/          # Tiles, scenarier, monstre
│   ├── hooks/         # Custom React hooks
│   └── ShadowsGame.tsx # Hoved-spillkomponent
├── pages/
│   └── Index.tsx      # Startside
└── components/ui/     # shadcn/ui komponenter
```

## Build & Deploy

### Lokal utvikling
```bash
npm install
npm run dev
```

### Test build
```bash
npm run build
npm run preview
```

### GitHub Pages deployment
Push til `main` branch → GitHub Actions bygger og deployer automatisk

## Kjente Begrensninger

1. **Chunk size warning**: JS bundle er >500KB (normal for spillprosjekt)
2. **Lovable tagger**: Kun aktiv i development mode
3. **Touch events**: Implementert, men kan trenge testing på flere enheter

## Kontakt

Repository: https://github.com/Tombonator3000/connect-play
