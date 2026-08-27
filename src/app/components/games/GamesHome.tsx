import { MenuBar } from "../menuBar";
import { useNavigate } from "react-router-dom";
import GamesTile, { GamesTileProps } from "./GamesTile";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/reducers/RootReducer";
import { terminal as T, fontStacks } from "../../../theme";

function GamesHome({ isDemo = false }: { isDemo?: boolean }) {
  const navigate = useNavigate();
  const { profile } = useSelector((state: RootState) => state);
  const hasActiveOverUnderPool = profile.owner?.pools?.some(
    (p) => p.type === "over-under-wins",
  );
  const THA_GAMES: GamesTileProps[] = [
    {
      altTitle: "Over/Unders Game",
      disabled: !hasActiveOverUnderPool,
      onClick: () => navigate(`/over-unders`),
      tooltip:
        "Available in the pre-season. Choose if teams will beat their expectations.",
      imgFile: process.env.PUBLIC_URL + "/over_unders_logo.png",
    },
    {
      altTitle: "Playoff Confidence Game",
      disabled: false,
      onClick: () => navigate(`/confidence`),
      tooltip:
        "Available in the playoffs. Make your playoff picks and earn points based on your confidence.",
      imgFile: process.env.PUBLIC_URL + "/playoff_confidence_logo.png",
    },
  ];
  return (
    <div
      className="flex flex-col justify-start items-center"
      style={{
        overflowX: "hidden",
        minHeight: "100vh",
        background: T.bg,
        fontFamily: fontStacks.sans,
      }}
    >
      <MenuBar />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 420px))",
          gap: 16,
          justifyContent: "center",
          width: "100%",
          padding: 16,
        }}
      >
        {THA_GAMES.map((g, i) => {
          return <GamesTile key={i} {...g} />;
        })}
      </div>
    </div>
  );
}

export default GamesHome;
