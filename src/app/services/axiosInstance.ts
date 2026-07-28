import axios from "axios";
import {
  isDemoMode,
  isBlockedInDemo,
  notifyDemoBlocked,
  DemoWriteBlockedError,
} from "./demoMode";

/**
 * Shared axios instance used by all API services.
 * The AxiosAuthInterceptor component sets the token getter once Auth0 is ready,
 * after which every request automatically carries `Authorization: Bearer <token>`.
 *
 * NOTE: For the Bearer token to be a signed JWT (rather than an opaque token),
 * your Auth0 application must have an API audience configured and that audience
 * must be passed to Auth0Provider via `authorizationParams.audience`.
 */
export const axiosInstance = axios.create({ timeout: 45000 });

type GetTokenFn = () => Promise<string>;
let getTokenFn: GetTokenFn | null = null;

export const setTokenGetter = (fn: GetTokenFn) => {
  getTokenFn = fn;
};

axiosInstance.interceptors.request.use(async (config) => {
  // Demo safety net: never let a state-mutating request reach the backend in
  // demo mode. Normal demo flows simulate writes locally, so this should rarely
  // fire — it guarantees a regression can't silently mutate production.
  if (isDemoMode() && isBlockedInDemo(config.method, config.url)) {
    notifyDemoBlocked();
    return Promise.reject(new DemoWriteBlockedError());
  }
  if (getTokenFn) {
    try {
      const token = await getTokenFn();
      config.headers.Authorization = `Bearer ${token}`;
    } catch {
      // Token unavailable (user not authenticated or session expired) — send without
    }
  }
  return config;
});

// Normalize API error messages so every catch block gets e.message = the API's friendlyMessage.
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.friendlyMessage ||
      error.response?.data?.FriendlyMessage ||
      error.message ||
      "An error occurred.";
    return Promise.reject(new Error(message));
  },
);
