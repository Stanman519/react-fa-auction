import { Autocomplete, Divider, TextField } from '@mui/material';
import { useSelector } from 'react-redux';
import { FreeAgent } from '../../redux/reducers/FreeAgentReducer';
import Bid from '../../redux/reducers/LotReducer';
import { RootState } from '../../store';
import { BioAndHistory } from '../bioAndHistory';
import { BidInfo } from './bidInfo';
import { Headshot } from './headshot';
import { PlayerInfo } from './playerInfo';
import './styles/lot.scss';

interface PlayerCardProps {
  player?: FreeAgent
  bidInfo?: Bid
  lotId: number,
  screenWidth: number
}

export const PlayerCard = ({ player, bidInfo, lotId, screenWidth }: PlayerCardProps) => {
  const { freeAgents } = useSelector((state: RootState) => state);
  return (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
      <div style={{ flex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <Headshot lotId={lotId} img={player?.headshot ?? ''} player={player} />
        {bidInfo && <BioAndHistory bid={bidInfo} screenWidth={screenWidth} />}
      </div>
      <div style={{ flexDirection: 'column', flex: 3 }}>
        {bidInfo?.bidId && player ?
          <div style={{ }}>
            <div>
              <PlayerInfo
                firstName={player.firstName}
                lastName={player.lastName}
                position={player.position} />
            </div>
            <Divider variant='middle' />
            <div>
              <BidInfo
                bidYears={bidInfo.bidLength}
                bidSalary={bidInfo.bidSalary}
                highBidder={bidInfo.ownername}
              />
            </div>
          </div>
          :
          <div style={{ minWidth: 240, paddingLeft: 10, backgroundColor: 'yellow' }}>
            <Autocomplete
              disablePortal
              id="free-agent-selection"
              options={freeAgents}
              getOptionLabel={(option) => `${option.position ?? ''} ${option.fullName ?? ''}`}
              renderInput={(params) => <TextField {...params} label="Choose a player" />}
            />
          </div>}
      </div>
    </div>

  );


}
