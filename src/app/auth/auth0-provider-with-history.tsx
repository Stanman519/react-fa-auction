import React from "react";
import { Auth0Provider } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";

const Auth0ProviderWithHistory = ({ children }: { children: any }) => {
  const domain = process.env.REACT_APP_AUTH0_DOMAIN ?? "";
  const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID ?? "";

  const navigate = useNavigate();

  const onRedirectCallback = (appState: any) => {
    navigate("/auth-callback", {
      state: { returnTo: appState?.returnTo || null },
      replace: true,
    });
  };

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: process.env.REACT_APP_AUTH0_AUDIENCE,
      }}
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
};

export default Auth0ProviderWithHistory;
