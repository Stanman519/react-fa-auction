# Navigation & Redux State Management Refactor

## Overview

This refactor fixes critical navigation issues caused by:

- Auth0 redirect happening before profile sync completes
- `currentLeague` being used as both derived and mutable state, causing field loss
- Redirect logic scattered across components without coordination
- Race conditions between API calls and re-renders
- Inconsistent mobile detection across the app

**Result:** Clean, predictable routing with proper state synchronization and no lost data.

---

## Key Changes

### 1. **Auth Callback Route (`/auth-callback`)**

**What changed:**

- Created new `src/app/components/AuthCallback.tsx` component
- This is now the destination after Auth0 login, not directly `/`
- AuthCallback waits for `authSynchronized = true` before routing to final destination
- Routes based on profile state:
  - No leagues → `/games`
  - League is auctioning → `/auction`
  - Default → `/` (HomeBase/league info)

**Why:**

- Prevents any component from rendering until DB profile sync is complete
- Eliminates race conditions where HomeBase would redirect before data loads
- Single source of truth for post-login routing logic

**Files updated:**

- `src/app/components/AuthCallback.tsx` (new)
- `src/App.tsx`: Added `/auth-callback` route
- `src/app/auth/auth0-provider-with-history.tsx`: Routes to `/auth-callback` on redirect

### 2. **Per-League Redirect State**

**What changed:**

- Added `redirected?: string | null` field to `LeagueLoginInfo` interface
- Each league now tracks if it has already redirected to auction this session
- Removed global `profile.redirected` field dependency

**Why:**

- Previous approach: module-level variable or component ref lost on unmount
- New approach: persisted in Redux per-league, survives navigation
- Can switch between leagues without losing track of which were already redirected

**Files updated:**

- `src/app/redux/reducers/OwnerReducer.ts`: Added `redirected` field to interface

### 3. **HomeBase Redirect Logic**

**What changed:**

```tsx
// OLD: checked profile.redirected, used useRef
if (currentLeague?.league.isAuctioning && redirected != "auction") {
  dispatch(redirectToAuction());
  nav("/auction");
}

// NEW: checks league.redirected, sets it per-league
if (
  currentLeague.league.isAuctioning &&
  currentLeague.redirected !== "auction"
) {
  // Set the flag in Redux for this league
  const leagues = [...(owner?.leagues ?? [])];
  const idx = leagues.findIndex((l) => l.league.leagueId === currentLeagueId);
  if (idx !== -1) {
    leagues[idx] = { ...leagues[idx], redirected: "auction" };
    dispatch(updateLoginInfo({ ...profile, owner: { ...owner, leagues } }));
  }
  nav("/auction", { replace: true });
}
```

**Why:**

- One-time redirect per league (not globally)
- Flag survives component unmount/remount
- Navigating away and back does NOT re-trigger redirect

**Files updated:**

- `src/app/components/HomeBase.tsx`

### 4. **PrivateRoute Waits for Auth Sync**

**What changed:**

```tsx
// OLD: only checked Auth0 isLoading
if (isLoading) return <Spinner />;
return isAuthenticated ? element : <Navigate to="/landing" />;

// NEW: also waits for profile.authSynchronized
if (isLoading || (isAuthenticated && !authSynchronized)) return <Spinner />;
return isAuthenticated ? element : <Navigate to="/landing" />;
```

**Why:**

- Ensures protected routes don't render until profile is ready
- Prevents components from seeing undefined `currentLeague`

**Files updated:**

- `src/App.tsx`

### 5. **Centralized Mobile Detection**

**What changed:**

- Added `useIsMobile(breakpoint = 720)` hook to `src/app/hooks.ts`
- Replaces inline `window.innerWidth < 720` checks
- Used in menuBar and FreeAgentGridModal

```tsx
// OLD: menuBar checks window.innerWidth on every render
{window.innerWidth < 720 ? (...mobile UI...) : (...desktop UI...)}

// NEW: uses hook
const isMobile = useIsMobile(720);
{isMobile ? (...mobile UI...) : (...desktop UI...)}
```

**Why:**

- Single source of truth for mobile breakpoint
- Responsive to window resize
- Easier to adjust globally (only in hook)
- Consistent across all components

**Files updated:**

- `src/app/hooks.ts`: Added hook
- `src/app/components/menuBar.tsx`: Uses hook
- `src/app/components/FreeAgentGridModal.tsx`: Uses hook

### 6. **Removed Global Redirect Action**

**What changed:**

- Removed `redirectToAuction()` action from `LoginActions.ts`
- No longer dispatch to set global redirect flag
- Redirect state is now per-league in Redux

**Why:**

- Global flag was cleared on profile sync, causing repeated redirects
- Per-league approach is more flexible and accurate
- Simplifies action logic

**Files updated:**

- `src/app/redux/actions/LoginActions.ts`
- `src/app/components/menuBar.tsx`: Removed `dispatch(redirectToAuction())` calls

### 7. **Cleaned Up LoginActions**

**What changed:**

- `synchronizeAuth0WithDbLogin`: No longer sets `redirected: ""`
- Per-league redirect flag lives in leagues array, not cleared on sync

**Why:**

- Prevents accidental clearing of redirect state
- Auth sync doesn't interfere with league-specific state

**Files updated:**

- `src/app/redux/actions/LoginActions.ts`

---

## Data Flow Diagram

### Login Flow (New)

```
1. User logs in → Auth0 redirect to /auth-callback
2. Auth0Provider calls onRedirectCallback → navigate("/auth-callback")
3. AuthCallback component loads
4. AuthProviderWrapper dispatch synchronizeAuth0WithDbLogin(user)
5. DB profile loads → profile.authSynchronized = true
6. AuthCallback useEffect detects authSynchronized
7. Routes to final destination:
   - No leagues → /games
   - Auctioning → /auction
   - Otherwise → / (HomeBase)
```

### During League Switch (New)

```
1. User clicks LeagueSwitchMenu → updateCurrentLeague(newLeagueId)
2. currentLeagueId updated in Redux
3. Components re-render with new currentLeague
4. HomeBase detects currentLeague changed
5. Checks league.redirected flag
   - If "auction" → already redirected, don't redirect again
   - If null/undefined → redirect to /auction and set flag
6. Navigates and updates league.redirected in Redux
```

---

## Migration Guide for Future Work

### Adding New Actions That Update League Data

Always follow this pattern:

```tsx
export const myAction = () => async (dispatch, getState) => {
  const { profile } = getState();
  const leagues = [...profile.owner.leagues];
  const idx = leagues.findIndex(l => l.league.leagueId === profile.currentLeagueId);
  if (idx === -1) return;

  // Fetch data
  const data = await SomeApiSvc.getData(...);

  // Update the league in the array
  leagues[idx] = {
    ...leagues[idx],
    myField: data,
  };

  // Dispatch with updated owner.leagues
  dispatch(updateLoginInfo({
    ...profile,
    owner: {
      ...profile.owner,
      leagues,
    },
  }));
};
```

**Key points:**

- Always copy `leagues` array
- Find correct league by index
- Spread the league object when updating
- Update full `owner.leagues` in dispatch, never just a single property

### Adding New Redirect Logic

Don't use global flags. Instead:

```tsx
// Check per-league flag
if (condition && currentLeague?.redirected !== "flag") {
  // Set the flag
  const leagues = [...owner.leagues];
  const idx = leagues.findIndex((l) => l.league.leagueId === currentLeagueId);
  leagues[idx] = { ...leagues[idx], redirected: "flag" };
  dispatch(updateLoginInfo({ ...profile, owner: { ...owner, leagues } }));

  // Navigate
  nav("/destination", { replace: true });
}
```

---

## Testing Checklist

- [ ] Login flow: confirm `/auth-callback` shows spinner, waits for sync, routes correctly
- [ ] No leagues user: logs in → routes to `/games`
- [ ] Auctioning league: logs in → routes to `/auction`
- [ ] Non-auctioning league: logs in → routes to `/`
- [ ] Return from auction: click "League Info" → HomeBase renders, NO redirect back to /auction
- [ ] Dashboard data loads: TaxiSquad, FranchiseTags, DeadCap all persist after redirect
- [ ] Switching leagues: menu works, data refreshes, correct redirect applies per league
- [ ] Mobile menu: compact on mobile, full on desktop (check at 720px boundary)
- [ ] Type checking: `npm run build` or TSC passes
- [ ] No console warnings about redirected state

---

## Files Modified Summary

| File                                           | Change                                                                           | Type      |
| ---------------------------------------------- | -------------------------------------------------------------------------------- | --------- |
| `src/App.tsx`                                  | Remove Auth0Provider direct usage, add /auth-callback route, update PrivateRoute | **Major** |
| `src/app/components/AuthCallback.tsx`          | **NEW** component for post-login routing                                         | **New**   |
| `src/app/auth/auth0-provider-with-history.tsx` | Route to /auth-callback instead of appState.returnTo                             | **Minor** |
| `src/app/components/HomeBase.tsx`              | Use per-league redirected flag, remove useRef                                    | **Major** |
| `src/app/components/menuBar.tsx`               | Use useIsMobile, remove redirectToAuction dispatches                             | **Minor** |
| `src/app/components/FreeAgentGridModal.tsx`    | Use useIsMobile, remove window resize listener                                   | **Minor** |
| `src/app/redux/reducers/OwnerReducer.ts`       | Add redirected field to LeagueLoginInfo                                          | **Minor** |
| `src/app/redux/actions/LoginActions.ts`        | Remove redirected: "" from sync, remove redirectToAuction action                 | **Minor** |
| `src/app/hooks.ts`                             | Add useIsMobile hook                                                             | **New**   |

---

## Architecture Improvements

### Before

- Auth0 → App root → Components redirect (race conditions)
- currentLeague used as mutable state + derived value (divergence)
- Mobile checks scattered throughout app
- Global redirect flag cleared on profile sync

### After

- Auth0 → /auth-callback (waits for sync) → Final route (clean)
- currentLeague derived only from leagues array (single source of truth)
- Mobile detection centralized in hook
- Per-league redirect state, never cleared accidentally

---

## Future Enhancements

1. **Global loading state:** Consider a global `isInitializing` flag in Redux to show splash screen during early app load
2. **Persistent redirect state:** Store per-league redirect flags in localStorage if you want to remember redirects across browser sessions
3. **Deep linking:** Use `AuthCallback`'s returnTo state to support deep links after login
4. **Error boundaries:** Add error boundary around AuthCallback to handle sync failures gracefully

---

## Questions?

This refactor establishes clean patterns for:

- ✅ One-time redirects per-league
- ✅ Waiting for async state before rendering
- ✅ Keeping league data in a single Redux location
- ✅ Responsive mobile detection
- ✅ Predictable post-login routing

All future navigation logic should follow these patterns.
