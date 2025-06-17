import { Avatar } from "@mui/material";
import { memo } from "react";
import { PlayerDTO } from "../../redux/reducers/FreeAgentReducer";
import { ownerMap, tmColorMap } from "../../services/Common";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/reducers/RootReducer";

export function Headshot({
  img,
  lotId,
  player,
}: {
  img?: string;
  lotId: number;
  player?: PlayerDTO;
}): JSX.Element {
  const capnMug = process.env.PUBLIC_URL + "/capnMug.jpg";
  const capnWtf = process.env.PUBLIC_URL + "/capn-wtf.png";
  const robin = process.env.PUBLIC_URL + "/jumanji-robin.jpg";
  const leagueId = useSelector(
    (state: RootState) => state.profile.currentLeagueId ?? 0,
  );
  const teamLogo = tmColorMap.find((tm) => tm.team === player?.team)?.logo;

  const defaultPic = leagueId === 13894 ? capnMug : robin;
  return (
    <>
      {!player ? (
        <div>
          <img className="max-h-24 max-h-52 max-w-full" alt="" src={capnWtf} />
        </div>
      ) : (
        <div
          className="bg-no-repeat bg-contain"
          style={{ backgroundImage: `url('${teamLogo}')` }}
        >
          <img
            style={{ borderRadius: img ? 0 : 25, marginBottom: img ? 0 : 12 }}
            className="headshot"
            src={img ? img : defaultPic}
          />
        </div>
      )}
    </>
  );
}

export const MemoHeadshot = memo(Headshot);
