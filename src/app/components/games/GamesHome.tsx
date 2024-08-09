import { MenuBar } from "../menuBar";
import { useNavigate } from "react-router-dom";
import GamesTile, { GamesTileProps } from "./GamesTile";

function GamesHome({ isDemo = false }: { isDemo?: boolean }) {
  const navigate = useNavigate();
  const THA_GAMES: GamesTileProps[] = [
    {
      altTitle: "Over/Unders Game",
      disabled: false,
      onClick: () => navigate(`/over-unders`),
      tooltip:
        "Available in the pre-season. Choose if teams will beat their expectations.",
      imgFile: process.env.PUBLIC_URL + "/over_unders_logo.png",
    },
    {
      altTitle: "Playoff Confidence Game",
      disabled: true,
      onClick: () => {},
      tooltip:
        "Available in the playoffs. Make your playoff picks and earn points based on your confidence.",
      imgFile: process.env.PUBLIC_URL + "/playoff_confidence_logo.png",
    },
  ];
  return (
    <div
      className="flex flex-col justify-start items-center "
      style={{ overflowX: "hidden", overflowY: "hidden", minHeight: "100vh" }}
    >
      <MenuBar barOptions={[]} />
      <div className="flex flex-col lg:flex-row w-full items-center justify-center">
        {THA_GAMES.map((g) => {
          return <GamesTile {...g} />;
        })}
      </div>
    </div>
  );
}

export default GamesHome;
