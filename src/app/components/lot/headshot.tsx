import { Avatar } from "@mui/material";
import { FreeAgent } from "../../redux/reducers/FreeAgentReducer";
import { ownerMap } from "../../services/Common";


export const Headshot = ({ img, lotId, player }: { img?: string, lotId: number, player?: FreeAgent }): JSX.Element => {
    const capnMug = process.env.PUBLIC_URL + '/capnMug.jpg';
    const avatar = ownerMap.find(o => o.id == lotId)?.avatar;
    return (
        <>
        {
            !player ? <Avatar variant='rounded' sx={{ flexGrow: 3, minHeight: 90, minWidth: 90, maxHeight: 200 }} alt="" src={avatar} /> 
            :
            <img className='headshot' src={img ? img : capnMug} />
        }
        </>
    );
  }
//   