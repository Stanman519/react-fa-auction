import { Chip } from "@mui/material";
import { tmColorMap } from "../../services/Common";
import './styles/lot.scss';


interface PlayerInfoProps {
    team?: string
    firstName: string
    lastName: string
    position: string
}


export const PlayerInfo = ({team, firstName, lastName, position}: PlayerInfoProps): JSX.Element => {
    const colorTeam = tmColorMap.find(tm => tm.team === team);
    return (
        <div className='player-info-container'>
            <Chip 
                label={position} style={{ backgroundColor: colorTeam?.primary, color: 'white', alignSelf: 'center', marginRight: 15, fontSize: 20, fontWeight: 'bold', padding: 10}}/> 
            <div style={{display: 'flex', marginBottom: 10, flexWrap:'wrap', justifyContent: 'center'}}>
                <h2 className='player-name-text' style={{fontWeight: 'normal'}}>{firstName}</h2>
                <h2 className='player-name-text' style={{fontWeight: 'bold'}}> &nbsp;{lastName}</h2>
            </div>
        </div>
    );
  }