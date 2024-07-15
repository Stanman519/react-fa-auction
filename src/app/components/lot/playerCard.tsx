import { Autocomplete, Divider, TextField } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { PlayerDTO } from '../../redux/reducers/FreeAgentReducer';
import { Bid, Lot } from '../../redux/reducers/LotReducer';
import { RootState } from '../../store';
//import { BioAndHistory } from './bioAndHistory';

import { Headshot, MemoHeadshot } from './headshot';
import { PlayerInfo } from './playerInfo';
import { tmColorMap } from '../../services/Common';
import { useState } from 'react';
import { selectPlayerToNominate } from '../../redux/actions/LotActions';
// @ts-ignore
import BidInfo from './BidInfo.tsx';

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
    <div className="flex flex-row items-center px-4 pt-4" >
      <div className="flex flex-col items-center w-1/3" >
        <MemoHeadshot lotId={lot.lotId} img={lot.bid?.player?.headshot ?? ''} player={lot.bid?.player} />
        {/* {lot.bid && <BioAndHistory bid={lot.bid} />} */}
      </div>
      <div className="flex-col w-2/3">
        {lot.bid?.bidId && lot.bid.player ?
          <div style={{ }}>
            <PlayerInfo
              team={lot.bid.player.team}
              firstName={lot.bid.player.firstName}
              lastName={lot.bid.player.lastName}
              position={lot.bid.player.position} />
            <Divider variant='middle' />
            <BidInfo lot={lot}/>

          </div>
          :
          
            <Autocomplete
              isOptionEqualToValue={(option, value) => option.mflId === value.mflId}
              disablePortal
              options={freeAgents}
              value={selectedPlayer ?? {firstName: '', lastName: ''} as PlayerDTO}
              onChange={(event: any, newValue) => {
                if (newValue) selectPlayerForNom(newValue)
              }}
              className="min-w-full ml-1"
              getOptionLabel={(option) => `${option.position ?? ''} ${option.fullName ?? ''}`}
              renderInput={(params) => <TextField {...params} label="Choose a player" />}
            />
          }
      </div>
    </div>

  );


}
