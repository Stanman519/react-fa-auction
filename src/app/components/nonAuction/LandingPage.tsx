import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";

export const LandingPage = () => {
  const logo = "./stanfan-color-logo.png";
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

  useEffect(() => {
    // If not loading and not authenticated, redirect to login
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect({
        appState: { returnTo: window.location.pathname }
      });
    }
  }, [isLoading, isAuthenticated, loginWithRedirect]);

  return (
    <div className="flex flex-row justify-center items-center max-w-screen-sm min-h-screen ">
      <div className="flex flex-col justify-center items-center max-w-full p-4 m-4">
        <img className="max-w-xs animate-pulse" src={logo} />
      </div>
    </div>
  );
};
