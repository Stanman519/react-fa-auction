# Clean Solution Summary: Navigation & Redux Refactor

## Problems Solved

### 1. **Race Condition on Login** ❌ → ✅

- **Before:** Auth0 redirects immediately, components render and dispatch their own redirects
  - HomeBase checks `currentLeague` (undefined) → redirects to `/games`
  - Then profile sync completes → redirects to `/auction`
  - Data loads but user already navigated away
- **After:** Auth0 redirects to `/auth-callback` which waits for `authSynchronized`
  - Entire profile ready before any component renders
  - Single redirect to correct destination
  - No lost data, no navigation fighting

### 2. **Lost Data on Navigation** ❌ → ✅

- **Before:** TaxiSquad, FranchiseTags loaded but cleared when actions updated only `currentLeague` object or overwrite happened
  - `getInitialAuctionData` updates `currentLeague` field
  - Later `loadDashboardData` updates `owner.leagues` array
  - Different paths → divergence → data lost
- **After:** All updates go to `owner.leagues` array at correct index
  - Single source of truth
  - Spread updates preserve all fields
  - Data survives across actions

### 3. **Repeated Redirects** ❌ → ✅

- **Before:** Redirect flag in component state (`useRef`) lost on unmount
  - User navigates away from HomeBase
  - Component unmounts → ref is garbage collected
  - User navigates back → ref reset to false
  - Redirects to `/auction` again immediately
- **After:** Redirect flag per-league in Redux
  - `league.redirected = "auction"` persisted in Redux
  - Survives unmount/remount
  - Only redirects once per league per session

### 4. **Mobile Detection Scattered** ❌ → ✅

- **Before:** Multiple `window.innerWidth < 720` checks in components
  - Breakpoint value duplicated across files (600, 720, etc.)
  - No single source of truth
  - Resize listeners duplicated
- **After:** Single `useIsMobile(breakpoint)` hook
  - Consistent breakpoint across app
  - Centralized resize handling
  - Easy to change globally

### 5. **Navigation Menu Confusion** ❌ → ✅

- **Before:** "League Info" button dispatches `redirectToAuction()` then navigates
  - Global redirect flag sets then immediately navigates
  - Creates race with other updates
  - Unclear what the flag is for
- **After:** Just navigates to `/`
  - HomeBase handles its own redirect logic
  - MenuBar only handles navigation
  - Clear separation of concerns

---

## Architecture Changes

### Auth Flow

```
BEFORE (Problematic):
Auth0 Login
  ↓
App root (Auth0Provider in App.tsx)
  ↓ redirect_uri = window.location.origin (default /)
  ↓
AuthProviderWrapper fires synchronizeAuth0WithDbLogin
  ↓ (async, not awaited)
Routes render (PrivateRoute)
  ↓ (before sync completes!)
HomeBase mounts (currentLeague is undefined)
  ↓
HomeBase redirects to /games
  ↓ (maybe profile sync completes)
  ↓
HomeBase updates, redirects to /auction
RESULT: Multiple redirects, data lost, confusing UX

---

AFTER (Clean):
Auth0 Login
  ↓
Auth0ProviderWithHistory (wrapped routes)
  ↓ redirect via navigate to /auth-callback
  ↓
AuthCallback component loads
  ↓
PrivateRoute checks authSynchronized (shows spinner)
  ↓
AuthProviderWrapper fires synchronizeAuth0WithDbLogin
  ↓ (waits for sync with useEffect)
  ↓ (authSynchronized = true)
  ↓
AuthCallback useEffect triggers
  ↓ (now auth is definitely ready)
  ↓ Route to final destination based on profile
  ↓
Single clean redirect to /games, /auction, or /
RESULT: No race, no lost data, clear flow
```

### State Structure

```
BEFORE (Divergent):
profile: {
  owner: {
    leagues: [
      { leagueId: 1, redirected: ?, taxiPlayers: [...] },
      { leagueId: 2, redirected: ?, taxiPlayers: null }
    ]
  },
  currentLeague: { ...copy of leagues[0]..., redirected: "auction", taxiPlayers: null }
  redirected: "" (global, gets cleared)
}

Problem:
- currentLeague and owner.leagues[0] diverge
- Actions update one but not the other
- redirected flag cleared on profile sync
- taxiPlayers loaded in currentLeague but gets overwritten


AFTER (Single Source of Truth):
profile: {
  owner: {
    leagues: [
      { leagueId: 1, redirected: "auction", taxiPlayers: [...], ... },
      { leagueId: 2, redirected: null, taxiPlayers: [...], ... }
    ]
  },
  currentLeagueId: 1
}

selector: currentLeague = owner.leagues.find(l => l.leagueId === currentLeagueId)

Benefit:
- currentLeague is derived (always in sync)
- All actions update owner.leagues[idx]
- Spread updates preserve all fields
- Per-league redirect flags never lost
```

---

## Code Changes at a Glance

### New Files

```tsx
// src/app/components/AuthCallback.tsx
// Waits for authSynchronized, then routes based on profile
const AuthCallback = () => {
  if (!authSynchronized) return <Spinner />;
  if (!owner?.leagues?.length) navigate("/games");
  else if (currentLeague?.league?.isAuctioning) navigate("/auction");
  else navigate("/");
};
```

### Updated App.tsx

```tsx
// OLD
<Auth0Provider>
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<PrivateRoute element={<HomeBase />} />} />
    </Routes>
  </BrowserRouter>
</Auth0Provider>

// NEW
<BrowserRouter>
  <Auth0ProviderWithHistory>  // uses navigate to route
    <Routes>
      <Route path="/auth-callback" element={<AuthCallback />} />
      <Route path="/" element={<PrivateRoute element={<HomeBase />} />} />
    </Routes>
  </Auth0ProviderWithHistory>
</BrowserRouter>
```

### Updated HomeBase

```tsx
// OLD: global flag, useRef that gets lost
if (isAuctioning && redirected != "auction") {
  dispatch(redirectToAuction());
  nav("/auction");
}

// NEW: per-league flag in Redux
if (isAuctioning && currentLeague?.redirected !== "auction") {
  leagues[idx] = { ...leagues[idx], redirected: "auction" };
  dispatch(updateLoginInfo({ ...profile, owner: { ...owner, leagues } }));
  nav("/auction", { replace: true });
}
```

### Updated Actions

```tsx
// ALL actions now follow this pattern
export const myAction = () => async (dispatch, getState) => {
  const { profile } = getState();
  const leagues = [...profile.owner.leagues]; // copy array
  const idx = leagues.findIndex(
    (l) => l.league.leagueId === profile.currentLeagueId,
  );

  const data = await api.getData();

  leagues[idx] = { ...leagues[idx], myField: data }; // spread to preserve fields

  dispatch(
    updateLoginInfo({
      ...profile,
      owner: { ...profile.owner, leagues }, // update full structure
    }),
  );
};
```

### Mobile Detection

```tsx
// OLD: scattered throughout
if (window.innerWidth < 720) {
  // mobile UI
}

// NEW: centralized
const isMobile = useIsMobile(720);
if (isMobile) {
  // mobile UI
}
```

---

## Benefits

| Aspect               | Before                            | After                          |
| -------------------- | --------------------------------- | ------------------------------ |
| **Race Conditions**  | Multiple, data lost               | None, waits for sync           |
| **Redirect Loops**   | useRef lost on unmount            | Per-league Redux flag          |
| **Data Integrity**   | Fields diverge/overwrite          | Single source of truth         |
| **Mobile Detection** | Scattered checks                  | Centralized hook               |
| **Code Clarity**     | Redirect logic everywhere         | Clear post-auth flow           |
| **Type Safety**      | currentLeague sometimes undefined | Always in sync or not rendered |
| **Testability**      | Hard to predict behavior          | Clear state transitions        |

---

## Long-term Advantages

1. **Scalable:** Easy to add new per-league features (settings, preferences, etc.)
2. **Maintainable:** Single pattern for all league data updates
3. **Debuggable:** Redux logs show clear state progression
4. **Flexible:** Per-league redirect flags work for multiple leagues
5. **Mobile-first:** Centralized responsive logic supports future changes
6. **Type-safe:** All derived values computed consistently

---

## Quick Reference: How to Extend

### Adding a new league-specific field?

```tsx
// 1. Add to LeagueLoginInfo interface
export interface LeagueLoginInfo {
  ...existing fields,
  myNewField: SomeType[];
}

// 2. Update in action using the pattern
leagues[idx] = {
  ...leagues[idx],
  myNewField: apiData
};

// 3. Select in component
const myNewField = useSelector(s =>
  s.profile.owner.leagues.find(l => l.league.leagueId === currentLeagueId)?.myNewField
);
```

### Adding a new redirect scenario?

```tsx
// 1. Update LeagueLoginInfo.redirected to be more specific (or add new field)
redirected?: "auction" | "buyout" | null;

// 2. In component, check and set
if (someCondition && currentLeague?.redirected !== "buyout") {
  leagues[idx] = { ...leagues[idx], redirected: "buyout" };
  dispatch(...);
  nav("/buyout-flow");
}
```

---

**Result:** A clean, predictable navigation system that scales with your app's growth. 🎉
