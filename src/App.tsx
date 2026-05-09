import { useEffect } from "react";
import { useTheme } from "@mui/material";
import AuctionHome from "./app/components/AuctionHome";
import HomeBase from "./app/components/HomeBase";
import AuthCallback from "./app/components/AuthCallback";
//import "./index.css"
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import Auth0ProviderWithHistory from "./app/auth/auth0-provider-with-history";
import AxiosAuthInterceptor from "./app/components/AxiosAuthInterceptor";
import { LandingPage } from "./app/components/nonAuction/LandingPage";
import GamesHome from "./app/components/games/GamesHome";
import { ConfidenceAdminHome } from "./app/components/confidence/admin/AdminHome";
import { TermsOfService } from "./app/components/legal/TermsOfService";
import { PrivacyPolicy } from "./app/components/legal/PrivacyPolicy";
import OverUnderHome from "./app/components/games/OverUnders/OverUnderHome";
import AuctionRosters from "./app/components/AuctionRosters";
import { useAuth0 } from "@auth0/auth0-react";
import { useDispatch } from "react-redux";
import { synchronizeAuth0WithDbLogin } from "./app/redux/actions/LoginActions";
import { useAppSelector } from "./app/hooks";
import ConfidenceHome from "./app/components/confidence/ConfidenceHome";
import { AuctionTeamSalaryCapsSlab } from "./app/components/AuctionTeamSalaryCapsSlab";
import { OverUnderStandingsSlab } from "./app/components/games/OverUnders/OverUnderStandingsSlab";
import { LoadingScreen } from "./app/components/LoadingScreen";

function App() {
  return (
    <BrowserRouter>
      <Auth0ProviderWithHistory>
        <AxiosAuthInterceptor>
          <AppRoutes />
        </AxiosAuthInterceptor>
      </Auth0ProviderWithHistory>
    </BrowserRouter>
  );
}

function AppRoutes() {
  const theme = useTheme();
  const { user, isAuthenticated, isLoading } = useAuth0();
  const { authSynchronized } = useAppSelector((state) => state.profile);
  const dispatch = useDispatch();

  // Trigger auth sync when user logs in
  useEffect(() => {
    // console.log("[AppRoutes] Auth state:", {
    //   isLoading,
    //   isAuthenticated,
    //   userSub: user?.sub,
    //   authSynchronized,
    // });

    // Only sync if authenticated and not yet synced
    if (isAuthenticated && user?.sub && !authSynchronized) {
      // console.log(
      //   "[AppRoutes] Dispatching synchronizeAuth0WithDbLogin for user:",
      //   user.sub,
      // );
      dispatch(synchronizeAuth0WithDbLogin(user));
    }
  }, [isLoading, isAuthenticated, user, authSynchronized, dispatch]);

  return (
    <div
      className="min-h-screen max-w-screen"
      style={{ backgroundColor: theme.palette.background.default }}
    >
      <Routes>
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/auth-callback" element={<AuthCallback />} />
        <Route path="/" element={<PrivateRoute element={<SmartHome />} />} />
        <Route
          path="/league-home"
          element={<PrivateRoute element={<HomeBase />} />}
        />
        <Route
          path="/auction"
          element={<PrivateRoute element={<AuctionHome />} />}
        />
        <Route
          path="/confidence"
          element={<PrivateRoute element={<ConfidenceHome />} />}
        />
        <Route
          path="/games"
          element={<PrivateRoute element={<GamesHome />} />}
        />
        <Route
          path="/demo"
          element={<PrivateRoute element={<ConfidenceHome isDemo />} />}
        />
        <Route
          path="/admin"
          element={<PrivateRoute element={<ConfidenceAdminHome />} />}
        />
        <Route
          path="/over-unders"
          element={<PrivateRoute element={<OverUnderHome />} />}
        />
        <Route
          path="/rosters"
          element={<PrivateRoute element={<AuctionRosters />} />}
        />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      </Routes>
      <AuctionTeamSalaryCapsSlab />
      <OverUnderStandingsSlab />
    </div>
  );
}

export default App;

// Smart Home: redirects to the right place after auth sync.
// - Leagues exist → /league-home
// - No leagues → /games
const SmartHome: React.FC = () => {
  const { owner, authSynchronized } = useAppSelector((state) => state.profile);
  const { isLoading } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading || !authSynchronized) return;

    if (!owner?.leagues || owner.leagues.length === 0) {
      navigate("/games", { replace: true });
      return;
    }

    navigate("/league-home", { replace: true });
  }, [isLoading, authSynchronized, owner, navigate]);

  return <LoadingScreen />;
};

const PrivateRoute: React.FC<{ element: React.ReactElement }> = ({
  element,
}) => {
  const { isAuthenticated, isLoading, loginWithRedirect, error } = useAuth0();
  const { authSynchronized } = useAppSelector((state) => state.profile);

  // console.log("[PrivateRoute] Render state:", {
  //   isLoading,
  //   isAuthenticated,
  //   authSynchronized,
  // });

  if (error) {
    console.error("[PrivateRoute] Auth0 error:", error.message);
    return <LoadingScreen variant="error" />;
  }

  if (isLoading || (isAuthenticated && !authSynchronized)) {
    // console.log("[PrivateRoute] Showing loading spinner...");
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    // console.log("[PrivateRoute] Not authenticated, redirecting to Auth0 login");
    loginWithRedirect({
      appState: { returnTo: window.location.pathname },
    });
    return <LoadingScreen />;
  }

  // console.log("[PrivateRoute] Rendering protected element");
  return element;
};
