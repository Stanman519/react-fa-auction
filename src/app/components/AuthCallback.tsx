import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/reducers/RootReducer";
import { CircularProgress } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * AuthCallback component.
 * This is the landing route after Auth0 redirect.
 * It waits for the DB profile to sync (authSynchronized) and then navigates
 * to the appropriate route based on user's leagues and auction status.
 *
 * Flow:
 * 1. Auth0 redirects to /auth-callback after user logs in.
 * 2. AuthCallback waits for synchronizeAuth0WithDbLogin to complete (authSynchronized=true).
 * 3. Based on profile state, it routes:
 *    - /games if user has no leagues (games-only users)
 *    - /auction if current league is auctioning
 *    - / (HomeBase) otherwise
 */
const AuthCallback: React.FC = () => {
  const { authSynchronized, owner, currentLeagueId } = useSelector(
    (s: RootState) => s.profile,
  );
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as any)?.returnTo ?? null;

  useEffect(() => {
    console.log("[AuthCallback] Render state:", {
      authSynchronized,
      ownerId: owner?.ownerId,
      currentLeagueId,
      returnTo,
    });

    // Still waiting for auth sync
    if (!authSynchronized) {
      console.log("[AuthCallback] Waiting for authSynchronized...");
      return;
    }

    console.log("[AuthCallback] Auth synchronized, determining redirect...");

    // If an explicit returnTo was provided by Auth0 and it's not root or auth-callback, honor it
    if (returnTo && returnTo !== "/" && returnTo !== "/auth-callback") {
      console.log("[AuthCallback] Honoring returnTo:", returnTo);
      navigate(returnTo, { replace: true });
      return;
    }

    // User has no leagues -> route to games
    if (!owner || !owner.leagues || owner.leagues.length === 0) {
      console.log("[AuthCallback] No leagues found, routing to /games");
      navigate("/games", { replace: true });
      return;
    }

    // Find the current league
    const currentLeague = owner.leagues.find(
      (l) => l.league.leagueId === currentLeagueId,
    );

    // Fallback: if no current league found, route to games
    if (!currentLeague) {
      console.log("[AuthCallback] No current league found, routing to /games");
      navigate("/games", { replace: true });
      return;
    }

    // If auction is live, route to /auction; otherwise route to league info (/league-home)
    if (currentLeague.league?.isAuctioning) {
      console.log("[AuthCallback] Auction is live, routing to /auction");
      navigate("/auction", { replace: true });
    } else {
      console.log("[AuthCallback] Auction not live, routing to /league-home");
      navigate("/league-home", { replace: true });
    }
  }, [authSynchronized, owner, currentLeagueId, navigate, returnTo]);

  // Show loading spinner while waiting for sync
  const logo = "./stanfan-color-logo.png";
  return (
    <div className="flex flex-row justify-center items-center max-w-screen-sm min-h-screen ">
      <div className="flex-col justify-center items-center max-w-full p-4 m-4 ">
        <img className="max-w-xs animate-pulse" src={logo} />
        <p style={{ marginTop: 20, fontSize: 14, color: "#ccc" }}>
          Authenticating...
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;
