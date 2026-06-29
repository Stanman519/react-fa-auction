# FanPools — Web App

React / TypeScript frontend for **FanPools**, a dynasty fantasy-football platform for two leagues (~50 users). Year-round salary-cap management and a real-time free-agent auction, plus seasonal prediction games (NFL Playoff Confidence Pool and Over/Under).

## Highlights

- **Real-time auction UI** — multi-user shared countdown and live bid updates over **SignalR**; nominate players, bid, and watch lots resolve in real time.
- **Drag-to-rank confidence pool** — users rank every playoff matchup by confidence; a seasonal event that scales to ~50 users.
- **Multi-league** — league switching with a persisted preference and smart post-login routing based on league state (auction vs. dashboard vs. games).
- **Auth0 SPA auth** — token-injecting axios interceptor; private routes gated on both Auth0 and a backend profile sync.

## Stack

React 18 · TypeScript · Redux (thunk) · React Router v6 · MUI v5 + Tailwind CSS · SignalR (`@microsoft/signalr`) · Auth0

## Architecture

```
src/App.tsx              # routes; Auth0 + axios-interceptor wrappers
src/app/redux/           # thunk actions + reducers (profile, lots, signalR, confidence, …)
src/app/services/        # axios API layers (general + auction)
src/app/signalR/         # SignalR context + socket middleware
```

## Run

```bash
npm install
npm start      # CRA dev server + Tailwind/postcss watch (concurrent)
npm run build
```

Backend is the [Free Agency Auction API](https://github.com/Stanman519/free-agency-auction-api). Configuration via `REACT_APP_*` env vars (see `.env.example`). Deployed on Cloudflare Pages.
