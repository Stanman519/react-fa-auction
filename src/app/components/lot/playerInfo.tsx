import { Chip, Typography } from "@mui/material";
import { tmColorMap } from "../../services/Common";



interface PlayerInfoProps {
    team?: string
    firstName: string
    lastName: string
    position: string
}


export const PlayerInfo = ({team, firstName, lastName, position}: PlayerInfoProps): JSX.Element => {
    const colorTeam = tmColorMap.find(tm => tm.team === team);
    return (
        <div className='flex flex-row justify-center items-center mb-1 w-full flex-1'>
            <Chip 
                label={position} className="self-center mr-2 text-xl font-bold p-1" style={{ color: 'white', backgroundColor: colorTeam?.primary}}/> 
            <div className="flex flex-row justify-center flex-wrap">
                <div className='text-2xl'>{firstName}</div>
                <div className='text-2xl font-bold'> &nbsp;{lastName}</div>
            </div>
        </div>
    );
  }