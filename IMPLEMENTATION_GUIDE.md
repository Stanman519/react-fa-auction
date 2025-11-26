# Implementation Notes & Future Patterns

## Files Changed Summary

### Core Routing

1. **`src/App.tsx`**

   - Removed direct `Auth0Provider` usage
   - Changed to use `Auth0ProviderWithHistory` (wraps router)
   - Added `/auth-callback` route
   - Updated `PrivateRoute` to wait for `authSynchronized`

2. **`src/app/components/AuthCallback.tsx`** (NEW)

   - Post-login routing logic
   - Waits for profile sync
   - Routes to `/games`, `/auction`, or `/` based on profile state

3. **`src/app/auth/auth0-provider-with-history.tsx`**
   - Updated `onRedirectCallback` to navigate to `/auth-callback`
   - Passes `returnTo` in state for potential deep linking

### State Management

4. **`src/app/redux/reducers/OwnerReducer.ts`**

   - Added `redirected?: string | null` to `LeagueLoginInfo`
   - Allows per-league tracking of redirect state

5. **`src/app/redux/actions/LoginActions.ts`**
   - Removed `redirected: ""` from `synchronizeAuth0WithDbLogin`
   - Removed `redirectToAuction()` action (no longer needed)
   - Per-league redirect state now managed in HomeBase

### Component Updates

6. **`src/app/components/HomeBase.tsx`**

   - Changed from global `redirected` flag to per-league `league.redirected`
   - Removed `useRef` approach
   - Sets redirect flag in Redux for current league before navigating

7. **`src/app/components/menuBar.tsx`**

   - Replaced `window.innerWidth < 720` with `useIsMobile(720)`
   - Removed `dispatch(redirectToAuction())` calls
   - Now just navigates directly

8. **`src/app/components/FreeAgentGridModal.tsx`**
   - Replaced manual resize listener with `useIsMobile(600)`
   - Removed `useState` for isMobile

### Utilities

9. **`src/app/hooks.ts`**
   - Added `useIsMobile(breakpoint = 720)` hook
   - Centralized mobile detection logic

---

## Critical Patterns to Follow

### Pattern 1: Updating League Data

**DO:**

```tsx
// Always copy the array and spread the league object
const leagues = [...profile.owner.leagues];
const idx = leagues.findIndex(
  (l) => l.league.leagueId === profile.currentLeagueId,
);
if (idx === -1) return;

leagues[idx] = {
  ...leagues[idx],
  newField: value,
  anotherField: value2,
};

dispatch(
  updateLoginInfo({
    ...profile,
    owner: {
      ...profile.owner,
      leagues,
    },
  }),
);
```

**DON'T:**

```tsx
// ❌ Mutating directly (no re-render)
profile.owner.leagues[idx].taxiPlayers = newPlayers;

// ❌ Creating new object, losing other fields
leagues[idx] = { taxiPlayers: newPlayers };

// ❌ Only updating currentLeague (diverges from leagues array)
dispatch(
  updateLoginInfo({
    ...profile,
    currentLeague: { ...currentLeague, taxiPlayers: newPlayers },
  }),
);

// ❌ Clearing redirected globally
dispatch(updateLoginInfo({ ...profile, redirected: "" }));
```

### Pattern 2: Checking Redirect State

**DO:**

```tsx
// Check per-league flag
const alreadyRedirected = currentLeague?.redirected === "auction";
if (currentLeague?.league.isAuctioning && !alreadyRedirected) {
  // redirect logic
}
```

**DON'T:**

```tsx
// ❌ Using global flag that gets cleared
if (isAuctioning && redirected !== "auction") {
}

// ❌ Using component state that gets lost on unmount
const [hasRedirected, setHasRedirected] = useState(false);

// ❌ Checking undefined (will pass when redirected is null)
if (redirected === undefined) {
}
```

### Pattern 3: Selecting League Data in Components

**DO:**

```tsx
// Always select from leagues array by ID
const currentLeague = useSelector((state: RootState) =>
  state.profile.owner.leagues.find(
    (l) => l.league.leagueId === state.profile.currentLeagueId,
  ),
);
```

**DON'T:**

```tsx
// ❌ Selecting a separate currentLeague from profile
const currentLeague = useSelector((s) => s.profile.currentLeague);

// ❌ Selecting without checking currentLeagueId exists
const currentLeague = useSelector((s) => s.profile.owner.leagues[0]);
```

### Pattern 4: Mobile Detection

**DO:**

```tsx
// Use the hook
import { useIsMobile } from "../hooks";
const isMobile = useIsMobile(720);
```

**DON'T:**

```tsx
// ❌ Inline checks
if (window.innerWidth < 720) {
}

// ❌ useState + useEffect for something already in a hook
const [isMobile, setIsMobile] = useState(window.innerWidth < 720);
useEffect(() => {
  /* resize handler */
}, []);
```

---

## Common Pitfalls & How to Avoid Them

### Pitfall 1: "My redirect isn't working"

**Cause:** Using global `redirected` flag (removed)
**Fix:** Use per-league `league.redirected` in Redux

```tsx
// Set it when you redirect
leagues[idx] = { ...leagues[idx], redirected: "auction" };

// Check it before redirecting
if (currentLeague?.redirected !== "auction") {
  redirect;
}
```

### Pitfall 2: "Data disappeared after redirect"

**Cause:** Actions updating only `currentLeague` or partial objects
**Fix:** Always update full `owner.leagues` array

```tsx
dispatch(
  updateLoginInfo({
    ...profile,
    owner: {
      ...profile.owner,
      leagues, // full updated array
    },
  }),
);
```

### Pitfall 3: "Redirect happens twice when I go back to HomeBase"

**Cause:** Redirect flag in component state or not in Redux
**Fix:** Ensure flag is in Redux (`league.redirected`)

```tsx
// If you see this, the flag is being lost
// It should be in owner.leagues[idx].redirected, not component state
```

### Pitfall 4: "AuthCallback doesn't show"

**Cause:** Auth0 redirect not configured to go to `/auth-callback`
**Fix:** Check `Auth0ProviderWithHistory.onRedirectCallback`

```tsx
const onRedirectCallback = (appState: any) => {
  navigate("/auth-callback", {
    state: { returnTo: appState?.returnTo || null },
    replace: true,
  });
};
```

### Pitfall 5: "Mobile menu appears on desktop"

**Cause:** Using inline `window.innerWidth < 720` instead of hook
**Fix:** Use `useIsMobile(720)` which handles resize properly

---

## Testing Scenarios

### Scenario 1: New User, No Leagues

```
1. Login
2. Auth0 redirect to /auth-callback
3. AuthCallback sees no leagues
4. Navigates to /games ✓
```

### Scenario 2: Auction is Live

```
1. Login
2. Auth0 redirect to /auth-callback
3. AuthCallback sees league.isAuctioning = true
4. Navigates to /auction ✓
5. User clicks "League Info" in menu
6. Navigates to / (HomeBase)
7. HomeBase sees league.redirected = "auction"
8. Does NOT redirect back to /auction ✓
```

### Scenario 3: Multiple Leagues, Switch Between Them

```
1. Login with league A (auctioning)
2. Routes to /auction ✓
3. User clicks "League Info" menu → / ✓
4. User switches to league B (not auctioning) via LeagueSwitchMenu
5. currentLeagueId = league B
6. HomeBase mounts with new league
7. league B.redirected = null, not auctioning
8. Stays on / (no redirect) ✓
9. User switches back to league A
10. currentLeagueId = league A
11. HomeBase detects league.redirected = "auction"
12. Does NOT redirect (already redirected) ✓
```

### Scenario 4: API Data Loads Correctly

```
1. Login → /auth-callback → /auction
2. getInitialAuctionData loads → updates owner.leagues[idx]
3. User navigates to /
4. loadDashboardData loads taxiSquad, deadCap, etc.
5. Updates owner.leagues[idx] with new data
6. All fields from getInitialAuctionData are preserved ✓
```

---

## TypeScript / Type Safety

### Ensure Types are Correct

```tsx
// LeagueLoginInfo has redirected field
interface LeagueLoginInfo {
  // ...existing fields
  redirected?: string | null;
}

// currentLeague can be undefined
const currentLeague: LeagueLoginInfo | undefined = useSelector(...);

// Always check before using
if (!currentLeague) return null;

// TypeScript knows redirected might be undefined
if (currentLeague.redirected === "auction") { }
```

### Use Selector with Type Safety

```tsx
// Good: type is inferred
const currentLeague = useSelector((s: RootState) =>
  s.profile.owner.leagues.find(
    (l) => l.league.leagueId === s.profile.currentLeagueId,
  ),
);
// Type: LeagueLoginInfo | undefined

// Also good: explicit typing
const currentLeague = useSelector((s: RootState): LeagueLoginInfo | undefined =>
  s.profile.owner.leagues.find(
    (l) => l.league.leagueId === s.profile.currentLeagueId,
  ),
);
```

---

## Performance Considerations

### Selector Optimization

```tsx
// ✓ Memoized: will re-render only if result changes
const currentLeague = useSelector((s: RootState) =>
  s.profile.owner.leagues.find(
    (l) => l.league.leagueId === s.profile.currentLeagueId,
  ),
);

// ✗ Not memoized: creates new object every time
const { currentLeagueId } = useSelector((s) => s.profile);
const currentLeague = owner.leagues.find(
  (l) => l.league.leagueId === currentLeagueId,
);
// (This compares object references, always different)
```

### useIsMobile Performance

```tsx
// Hook handles resize efficiently with single listener per hook instance
const isMobile = useIsMobile(720); // one listener
const isMobile2 = useIsMobile(900); // separate listener (different breakpoint)

// In multiple components, only one listener per breakpoint value
```

---

## Debugging Tips

### Check Redirect Flag Status

```tsx
// In Redux DevTools, look at state.profile.owner.leagues[idx].redirected
// Should be: null (not yet), "auction" (already redirected), etc.
```

### Verify Auth Sync Completed

```tsx
// In Redux DevTools, check state.profile.authSynchronized
// Should be false while logging in, true once sync completes
```

### Monitor Navigation Flow

```tsx
// Add logs in AuthCallback
console.log("AuthCallback: authSynchronized=", authSynchronized);
console.log("AuthCallback: routing to", finalDestination);

// Add logs in HomeBase redirect
console.log(
  "HomeBase: checking redirect, league.redirected=",
  currentLeague?.redirected,
);
```

---

## Future Enhancements

### 1. Add Error Handling to AuthCallback

```tsx
if (!authSynchronized) return <Spinner />;
if (error) return <ErrorPage error={error} />;
// ... existing logic
```

### 2. Support Deep Linking

```tsx
// AuthCallback already has returnTo in state
// Use it for deep links after login
if (returnTo && returnTo.startsWith("/confident")) {
  navigate(returnTo, { replace: true });
}
```

### 3. Add Persistent Redirect State (localStorage)

```tsx
// If user closes browser during auction season, remember redirect on re-login
const savedRedirects = localStorage.getItem("leagueRedirects") || "{}";
// Apply to profile on sync
```

### 4. Global Loading State

```tsx
// Add isInitializing flag in Redux during auth flow
// Show splash screen or premium UI during initialization
```

---

## Rollback Instructions (if needed)

1. Restore `src/app/components/AuthCallback.tsx` deletion
2. Revert `src/App.tsx` to use `Auth0Provider` directly
3. Revert `HomeBase.tsx` to use global `redirected` flag
4. Re-add `redirectToAuction()` action to `LoginActions.ts`
5. Remove `redirected` field from `LeagueLoginInfo`
6. Revert menuBar and FreeAgentGridModal to inline width checks

(Or use git: `git log --oneline` and `git revert <commit>`)

---

This refactor establishes the foundation for clean, scalable navigation. Follow these patterns as you build new features! 🚀
