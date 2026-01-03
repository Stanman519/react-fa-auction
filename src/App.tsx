import { useEffect } from "react";
import { useTheme } from "@mui/material";
import AuctionHome from "./app/components/AuctionHome";
import HomeBase from "./app/components/HomeBase";
import AuthCallback from "./app/components/AuthCallback";
//import "./index.css"
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import Auth0ProviderWithHistory from "./app/auth/auth0-provider-with-history";
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

function App() {
  const theme = useTheme();

  return (
    <BrowserRouter>
      <Auth0ProviderWithHistory>
        <AppRoutes />
      </Auth0ProviderWithHistory>
    </BrowserRouter>
  );
}

function AppRoutes() {
  const theme = useTheme();
  const { user, isAuthenticated, loginWithRedirect, isLoading } = useAuth0();
  const { authSynchronized } = useAppSelector((state) => state.profile);
  const dispatch = useDispatch();

  // Trigger auth sync when user logs in
  useEffect(() => {
    console.log("[AppRoutes] Auth state:", {
      isLoading,
      isAuthenticated,
      userSub: user?.sub,
      authSynchronized,
    });

    if (!isLoading && !isAuthenticated) {
      console.log("[AppRoutes] Redirecting to Auth0 login...");
      // Store the current path so we can return here after login
      const returnTo = window.location.pathname + window.location.search;
      loginWithRedirect({
        appState: { returnTo }
      });
    }
    if (isAuthenticated && user?.sub) {
      console.log(
        "[AppRoutes] Dispatching synchronizeAuth0WithDbLogin for user:",
        user.sub,
      );
      dispatch(synchronizeAuth0WithDbLogin(user));
    }
  }, [isLoading, isAuthenticated, loginWithRedirect, user, dispatch]);

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
    </div>
  );
}

export default App;

// Smart Home component that redirects based on user's league status
const SmartHome: React.FC = () => {
  const { owner, authSynchronized } = useAppSelector((state) => state.profile);
  const navigate = useNavigate();

  useEffect(() => {
    if (authSynchronized) {
      // If user has a fantasy league, go to league home
      if (owner?.leagues && owner.leagues.length > 0) {
        navigate('/league-home', { replace: true });
      } else {
        // Otherwise go to games home
        navigate('/games', { replace: true });
      }
    }
  }, [authSynchronized, owner, navigate]);

  // Show loading while determining where to go
  const logo = "./stanfan-color-logo.png";
  return (
    <div className="flex flex-row justify-center items-center max-w-screen-sm min-h-screen ">
      <div className="flex-col justify-center items-center max-w-full p-4 m-4 ">
        <img className="max-w-xs animate-pulse" src={logo} alt="StanFan Logo" />
      </div>
    </div>
  );
};

const PrivateRoute: React.FC<{ element: React.ReactElement }> = ({
  element,
}) => {
  const { isAuthenticated, isLoading } = useAuth0();
  const { authSynchronized } = useAppSelector((state) => state.profile);
  const logo = "./stanfan-color-logo.png";

  console.log("[PrivateRoute] Render state:", {
    isLoading,
    isAuthenticated,
    authSynchronized,
  });

  // Show loading spinner while Auth0 is checking session or profile is syncing
  if (isLoading || (isAuthenticated && !authSynchronized)) {
    console.log("[PrivateRoute] Showing loading spinner...");
    return (
      <div className="flex flex-row justify-center items-center max-w-screen-sm min-h-screen ">
        <div className="flex-col justify-center items-center max-w-full p-4 m-4 ">
          <img className="max-w-xs animate-pulse" src={logo} />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("[PrivateRoute] Not authenticated, redirecting to landing");
    return <Navigate to="/landing" />;
  }

  console.log("[PrivateRoute] Rendering protected element");
  return element;
};
