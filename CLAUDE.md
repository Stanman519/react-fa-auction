# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Dynasty fantasy football web app for two leagues (~50 total users). Two usage patterns:

- **Year-round (~15 users):** Salary cap management, trades, holdouts, taxi squad, franchise tags, waiver extensions, and a real-time free agent auction (eBay-style, SignalR multi-user shared timer, max 3 nominations/owner at a time)
- **Seasonal events (~50 users):** NFL Playoff Confidence Pool — users drag-and-rank picks across all playoff games; Over/Under predictions game

Quality bar: "show off to friends" — UI should look professional, not just functional. Owner is a backend engineer, so frontend polish is the primary area needing attention.

## Commands

```bash
npm start          # CRA dev server + postcss watch (runs concurrently)
npm run build      # CI=false react-scripts build (suppresses warnings)
npm test           # Jest via CRA
npm run watch:css  # postcss tailwind compilation only
```

No single-test command configured; use `npm test -- --testPathPattern=<file>` for targeted runs.

## Architecture

**Stack:** React 18 / TypeScript / Redux (thunk, not RTK slices) / React Router v6 / MUI v5 + Tailwind CSS
**Backend:** ASP.NET on Azure (`../free-agency-auction-api`); real-time auction bids via SignalR (`@microsoft/signalr`)
**Auth:** Auth0 (`@auth0/auth0-react`), env vars: `REACT_APP_AUTH0_DOMAIN`, `REACT_APP_AUTH0_CLIENT_ID`, `REACT_APP_AUTH0_AUDIENCE`

### Component tree

```
BrowserRouter
└── Auth0ProviderWithHistory        # src/app/auth/
    └── AxiosAuthInterceptor        # injects Bearer token via setTokenGetter()
        └── AppRoutes               # src/App.tsx — all route definitions
```

### Redux

Store at `src/app/store.ts` uses plain `thunk` middleware (not RTK's default middleware). Actions are thunks in `src/app/redux/actions/`; reducers in `src/app/redux/reducers/`. Use `useAppDispatch` / `useAppSelector` from `src/app/hooks.ts`.

Key slices: `profile` (owner + leagues + auth sync), `lots` (auction), `signalR`, `ui` (modal + loading), `owners`, `transactions`, `deadCap`, `confidence`, `overUnders`.

### API layer

- `src/app/services/axiosInstance.ts` — shared axios; token injected by `AxiosAuthInterceptor`
- `src/app/services/GeneralApiSvc.ts` — all non-auction calls
- `src/app/services/AuctionApiSvc.ts` — auction endpoints
- `src/app/signalR/` — SignalR context + socket middleware

### Styling

Tailwind (primary utilities/spacing) + MUI v5 components. Tailwind is compiled by postcss from `src/app/styles/index.tailwind.css` → `index.css`; the watch runs automatically with `npm start`.

### Auth flow

1. Auth0 redirects to `/auth-callback` post-login
2. `AppRoutes` useEffect: `isAuthenticated && !authSynchronized` → dispatches `synchronizeAuth0WithDbLogin(user)` → POST `/dashboard/auth` → returns `Owner` with leagues
3. `PrivateRoute` shows spinner until both Auth0 and profile sync complete

### Multi-league

`currentLeagueId` in Redux profile slice. Preference persisted to `localStorage` key `stanfan_default_league_id`. `SmartHome` handles post-login routing: auctioning league → `/auction`; leagues exist → `/league-home`; else → `/games`.

## Playwright MCP — Visual Verification

Use Playwright MCP tools proactively after any UI changes to verify layout, responsiveness, and polish. Dev server: `http://localhost:3000`.

### Auth — session

The entire app requires Auth0 login except `/landing` and `/demo`.

**Auth0 here uses the default in-memory cache, NOT localStorage.** `localStorage` and
`sessionStorage` are both empty — only two `auth0.*.is.authenticated` cookies exist. There is
no token JSON to export and re-inject, so a saved "session cache" is not possible without
switching the SDK to `cacheLocation="localstorage"`.

**To get an authenticated browser:** ask the user to log in via the Playwright window once.
Then **do not call `browser_navigate` again** — a fresh navigation restarts the Auth0 redirect
dance and can loop. Drive the already-loaded SPA in place (scroll/click/evaluate) instead.

**Reaching app internals without a code change** — useful for rendering states that depend on
data you don't have (e.g. the in-season Over/Under view out of season). Walk the React fiber
from `#root` to grab the Redux store and the Auth0 context, then dispatch directly:

```js
// find store (memoizedProps.store) and auth0 (memoizedProps.value.getAccessTokenSilently)
// by walking f.child / f.sibling from root[Object.keys(root).find(k => k.startsWith('__reactContainer$'))]
const token = await auth0.getAccessTokenSilently();
await fetch(url, { headers: { Authorization: 'Bearer ' + token } });
store.dispatch({ type: 'UPDATE_OUS', payload: { ...prev, /* ... */ } });
```
Stash the previous slice first and dispatch it back when done. Re-acquire the store after hot
reloads — the old reference goes stale.

### Visual verification workflow

After any UI change:
```
1. browser_navigate to the affected route
2. browser_take_screenshot — capture current state
3. browser_resize {width:390, height:844} — switch to mobile
4. browser_take_screenshot — verify mobile layout
5. browser_resize {width:1280, height:800} — restore desktop
```

**Key routes to check:**

| Route | What to verify |
|-------|----------------|
| `/league-home` | Dashboard tabs, badges, dead cap layout |
| `/auction` | Lot cards, sticky league bar, sort controls |
| `/confidence` | Drag-to-rank matchups, tab nav |
| `/games` | Game tile cards, hover states |
| `/demo` | Confidence demo (public, no auth needed) |

**Breakpoints:** 390×844 (iPhone 14 mobile), 768×1024 (tablet), 1280×800 (desktop)

**Other useful tools:**
- `browser_hover` — verify hover states on buttons/cards
- `browser_evaluate` — inspect computed styles: `getComputedStyle(document.querySelector('.my-class')).fontSize`
- `browser_console_messages` — catch silent JS errors after changes
- `browser_snapshot` — accessibility tree when interactive elements changed

**Limitations:** SignalR multi-user auction state can't be simulated with one browser instance. For auction UI, test with static/mock lot states if backend isn't live.

_(No auth session cache — see "Auth — session" above. Auth0 caches tokens in memory, so they
cannot be exported and replayed across browser sessions.)_
