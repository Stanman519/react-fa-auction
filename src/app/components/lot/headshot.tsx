import { Avatar } from "@mui/material";
import { memo } from "react";
import { PlayerDTO } from "../../redux/reducers/FreeAgentReducer";
import { ownerMap, tmColorMap } from "../../services/Common";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/reducers/RootReducer";


export function Headshot({ img, lotId, player }: { img?: string, lotId: number, player?: PlayerDTO }): JSX.Element {
    const capnMug = process.env.PUBLIC_URL + '/capnMug.jpg';
    const avatar = useSelector((state: RootState) => state.profile.authUser?.picture)
    const teamLogo = tmColorMap.find(tm => tm.team=== player?.team)?.logo;
    return (
        <>
        {
            player && 
            // ? 
            // <Avatar variant='rounded' className="max-h-24 max-h-52 max-w-full" alt="" src={avatar} /> 
            // :
            <div className="bg-no-repeat bg-contain" style={{ backgroundImage: `url('${teamLogo}')`}}>
                <img className='headshot' src={img ? img : capnMug} />
            </div>
        }
        </>
    );
  }

export const MemoHeadshot = memo(Headshot);