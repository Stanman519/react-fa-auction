export const LandingPage = () => {
  const logo = "./stanfan-color-logo.png";

  return (
    <div className="flex flex-row justify-center items-center max-w-screen-sm min-h-screen ">
      <div className="flex-col justify-center items-center max-w-full p-4 m-4 ">
        <img className="max-w-xs animate-pulse" src={logo} />
        {/* < Button onClick={() => loginWithRedirect()}> Log In</Button > */}
      </div>
    </div>
  );
};
