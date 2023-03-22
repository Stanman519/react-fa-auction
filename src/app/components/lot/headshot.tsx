import { Avatar } from "@mui/material";
import { memo } from "react";
import { PlayerDTO } from "../../redux/reducers/FreeAgentReducer";
import { ownerMap, tmColorMap } from "../../services/Common";


export function Headshot({ img, lotId, player }: { img?: string, lotId: number, player?: PlayerDTO }): JSX.Element {
    const capnMug = process.env.PUBLIC_URL + '/capnMug.jpg';
    const avatar = ownerMap.find(o => o.id=== lotId)?.avatar;
    const teamLogo = tmColorMap.find(tm => tm.team=== player?.team)?.logo;
    return (
        <>
        {
            !player ? <Avatar variant='rounded' sx={{ flexGrow: 3, minHeight: 90, minWidth: 90, maxHeight: 200 }} alt="" src={avatar} /> 
            :
            <div style={{ backgroundImage: `url('${teamLogo}')`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', margin: -5}}>
                <img className='headshot' src={img ? img : capnMug} />
            </div>
        }
        </>
    );
  }

export const MemoHeadshot = memo(Headshot);