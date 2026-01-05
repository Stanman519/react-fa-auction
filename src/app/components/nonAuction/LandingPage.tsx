export const LandingPage = () => {
  const logo = "./stanfan-color-logo.png";

  // This page is just a landing spot for Auth0 redirects
  // The auth0-provider-with-history will immediately call onRedirectCallback
  // which navigates to /auth-callback
  return (
    <div className="flex flex-row justify-center items-center max-w-screen-sm min-h-screen ">
      <div className="flex flex-col justify-center items-center max-w-full p-4 m-4">
        <img className="max-w-xs animate-pulse" src={logo} alt="StanFan Logo" />
      </div>
    </div>
  );
};
