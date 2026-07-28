/**
 * Demo-mode safety layer.
 *
 * When the public read-only demo is active, NO write may reach the backend.
 * This module holds a module-level flag (readable from the non-React axios /
 * fetch layer, like `setTokenGetter`) plus a React-registered notifier used to
 * surface the "read-only demo" snackbar.
 *
 * Two enforcement points consume this:
 *  - axiosInstance request interceptor (blocks POST/PUT/DELETE/PATCH + the
 *    GET-based trade mutations) — the catch-all safety net.
 *  - raw fetch() callers in AuctionApiSvc (makeNewBid/askCapn/register).
 *
 * In normal demo flow auction bids/noms/wins are simulated locally in the
 * thunks and never call the network, so these guards should rarely fire — they
 * exist so a regression can never silently mutate production.
 */

let demoMode = false;

export const setDemoMode = (on: boolean): void => {
  demoMode = on;
};

export const isDemoMode = (): boolean => demoMode;

/** GET requests whose path contains one of these mutate server state and must be blocked. */
export const DEMO_BLOCKED_GET_PATHS = [
  "accept-trade",
  "reject-trade",
  "revoke-trade",
];

export const DEMO_BLOCKED_MESSAGE =
  "Read-only demo — that action isn't saved. Sign in on the real site to do this for real.";

type NotifyFn = (message: string) => void;
let notifyFn: NotifyFn | null = null;

/** Registered by the React layer (DemoGate) to wire the snackbar. */
export const setDemoNotifier = (fn: NotifyFn | null): void => {
  notifyFn = fn;
};

export const notifyDemoBlocked = (message: string = DEMO_BLOCKED_MESSAGE): void => {
  notifyFn?.(message);
};

/**
 * Error rejected by the axios interceptor when a write is blocked in demo.
 * Shaped with a `.response.data.friendlyMessage` so both optional-chaining and
 * direct (`error.response.data.friendlyMessage`) catch handlers degrade to the
 * friendly message instead of crashing.
 */
export class DemoWriteBlockedError extends Error {
  response: { data: { friendlyMessage: string } };
  isDemoBlock = true;
  constructor(message: string = DEMO_BLOCKED_MESSAGE) {
    super(message);
    this.name = "DemoWriteBlockedError";
    this.response = { data: { friendlyMessage: message } };
  }
}

/** True if the method/url pair is a state-mutating request that demo must block. */
export const isBlockedInDemo = (method: string | undefined, url: string | undefined): boolean => {
  const m = (method || "get").toLowerCase();
  if (["post", "put", "delete", "patch"].includes(m)) return true;
  if (m === "get" && DEMO_BLOCKED_GET_PATHS.some((p) => (url || "").includes(p))) return true;
  return false;
};
