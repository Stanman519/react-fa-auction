import { Autocomplete, Divider, TextField } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { FreeAgent } from '../../redux/reducers/FreeAgentReducer';
import { Bid } from '../../redux/reducers/LotReducer';
import { RootState } from '../../store';
import { BioAndHistory } from './bioAndHistory';
import { BidInfo } from './bidInfo';
import { Headshot, MemoHeadshot } from './headshot';
import { PlayerInfo } from './playerInfo';
import './styles/lot.scss';
import { tmColorMap } from '../../services/Common';
import { useState } from 'react';
import { selectPlayerToNominate } from '../../redux/actions/LotActions';

interface PlayerCardProps {
  player?: FreeAgent
  bidInfo?: Bid
  lotId: number,
  screenWidth: number
}

export const PlayerCard = ({ player, bidInfo, lotId, screenWidth }: PlayerCardProps) => {
  const { freeAgents } = useSelector((state: RootState) => state);
  const [selectedPlayer, setSelectedPlayer] = useState<FreeAgent>();
  const dispatch = useDispatch();
  const selectPlayerForNom = (player: FreeAgent) => {
    setSelectedPlayer(player)
    dispatch(selectPlayerToNominate(player))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', padding: 10}}>
      <div style={{ flex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <MemoHeadshot lotId={lotId} img={player?.headshot ?? ''} player={player} />
        {bidInfo && <BioAndHistory bid={bidInfo} screenWidth={screenWidth} />}
      </div>
      <div style={{ flexDirection: 'column', flex: 3 }}>
        {bidInfo?.bidId && player ?
          <div style={{ }}>
            <div>
              <PlayerInfo
                team={player.team}
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
          
            <Autocomplete
              disablePortal
              id="free-agent-selection"
              options={freeAgents}
              value={selectedPlayer ?? {firstName: '', lastName: ''} as FreeAgent}
              onChange={(event: any, newValue) => {
                if (newValue) selectPlayerForNom(newValue)
              }}
              sx={{minWidth: 250, flex: 1, paddingLeft: '10px'}}
              getOptionLabel={(option) => `${option.position ?? ''} ${option.fullName ?? ''}`}
              renderInput={(params) => <TextField {...params} label="Choose a player" />}
            />
          }
      </div>
    </div>

  );


}
