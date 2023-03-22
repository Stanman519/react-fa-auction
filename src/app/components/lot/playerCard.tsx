import { Autocomplete, Divider, TextField } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { PlayerDTO } from '../../redux/reducers/FreeAgentReducer';
import { Bid, Lot } from '../../redux/reducers/LotReducer';
import { RootState } from '../../store';
import { BioAndHistory } from './bioAndHistory';
import { BidInfo } from './bidInfo';
import { Headshot, MemoHeadshot } from './headshot';
import { PlayerInfo } from './playerInfo';
import { tmColorMap } from '../../services/Common';
import { useState } from 'react';
import { selectPlayerToNominate } from '../../redux/actions/LotActions';

interface PlayerCardProps {
  lot: Lot
}

export const PlayerCard = ({ lot }: PlayerCardProps) => {
  const { freeAgents } = useSelector((state: RootState) => state);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerDTO>();
  const {isMobile} = useSelector((state: RootState) => state.ui)
  const dispatch = useDispatch();
  const selectPlayerForNom = (player: PlayerDTO) => {
    setSelectedPlayer(player)
    dispatch(selectPlayerToNominate(player))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', padding: 10}}>
      <div style={{ flex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <MemoHeadshot lotId={lot.lotId} img={lot.bid?.player?.headshot ?? ''} player={lot.bid?.player} />
        {lot.bid && <BioAndHistory bid={lot.bid} />}
      </div>
      <div style={{ flexDirection: 'column', flex: 3 }}>
        {lot.bid?.bidId && lot.bid.player ?
          <div style={{ }}>
            <div>
              <PlayerInfo
                team={lot.bid.player.team}
                firstName={lot.bid.player.firstName}
                lastName={lot.bid.player.lastName}
                position={lot.bid.player.position} />
            </div>
            <Divider variant='middle' />
            <div>
              <BidInfo lot={lot}/>
            </div>
          </div>
          :
          
            <Autocomplete
              disablePortal
              id="free-agent-selection"
              options={freeAgents}
              value={selectedPlayer ?? {firstName: '', lastName: ''} as PlayerDTO}
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
