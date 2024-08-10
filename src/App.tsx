import { useEffect } from "react";
import { useTheme } from "@mui/material";
import AuctionHome from "./app/components/AuctionHome";
import HomeBase from "./app/components/HomeBase";
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
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { useDispatch, useSelector } from "react-redux";
import { synchronizeAuth0WithDbLogin } from "./app/redux/actions/LoginActions";
import { RootState } from "./app/redux/reducers/RootReducer";

function App() {
  const theme = useTheme();
  const { user, isAuthenticated, loginWithRedirect, isLoading } = useAuth0();
  const { authSynchronized } = useSelector((state: RootState) => state.profile);
  const dispatch = useDispatch();
  const domain = process.env.REACT_APP_AUTH0_DOMAIN ?? "";
  const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID ?? "";

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
      }}
    >
      <BrowserRouter>
        <AuthProviderWrapper>
          <div
            className="min-h-screen max-w-screen"
            style={{ backgroundColor: theme.palette.background.default }}
          >
            <Routes>
              <Route path="/landing" element={<LandingPage />} />
              <Route
                path="/"
                element={<PrivateRoute element={<HomeBase />} />}
              />
              <Route
                path="/auction"
                element={<PrivateRoute element={<AuctionHome />} />}
              />
              <Route
                path="/games"
                element={<PrivateRoute element={<GamesHome />} />}
              />
              <Route
                path="/demo"
                element={<PrivateRoute element={<GamesHome isDemo />} />}
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
        </AuthProviderWrapper>
      </BrowserRouter>
    </Auth0Provider>
  );
}

export default App;

const AuthProviderWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, loginWithRedirect, isLoading, user } = useAuth0();
  const { profile } = useSelector((state: RootState) => state);
  const dispatch = useDispatch();
  const nav = useNavigate();
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect();
    }
    if (isAuthenticated && user?.sub) {
      dispatch(synchronizeAuth0WithDbLogin(user));
    }
  }, [isLoading, isAuthenticated, loginWithRedirect, user]);

  return <>{children}</>;
};

const PrivateRoute: React.FC<{ element: React.ReactElement }> = ({
  element,
}) => {
  const { isAuthenticated, isLoading } = useAuth0();
  const logo = "./stanfan-color-logo.png";
  if (isLoading)
    return (
      <div className="flex flex-row justify-center items-center max-w-screen-sm min-h-screen ">
        <div className="flex-col justify-center items-center max-w-full p-4 m-4 ">
          <img className="max-w-xs animate-pulse" src={logo} />
          {/* < Button onClick={() => loginWithRedirect()}> Log In</Button > */}
        </div>
      </div>
    );

  return isAuthenticated ? element : <Navigate to="/landing" />;
};
