import { useAuth0 } from "@auth0/auth0-react";
import { setTokenGetter } from "../services/axiosInstance";

/**
 * Mounts inside Auth0Provider. Once the user is authenticated it registers
 * `getAccessTokenSilently` with the shared axios instance so every subsequent
 * request automatically carries `Authorization: Bearer <token>`.
 */
const AxiosAuthInterceptor: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  // Set synchronously during render (not useEffect) so the token getter is
  // available before child effects fire. React fires child useEffects before
  // parent useEffects, which would cause the first API call to have no token.
  if (isAuthenticated) {
    setTokenGetter(getAccessTokenSilently);
  }

  return <>{children}</>;
};

export default AxiosAuthInterceptor;
