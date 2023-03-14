import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { useTheme } from '@mui/material/styles';
import { Button, Card, Chip, Divider, Fab, ToggleButtonGroup } from '@mui/material';
import { lastYear, tmColorMap } from "../../services/Common";
import { LegacyRef, RefObject, useRef, useState } from "react";
import StyledToggleButton from "./StyledToggleButton";
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { TogglePlayerCardButton } from "./TogglePlayerCardButton";
import { ConfirmModal } from "../ConfirmModal";
import { updateUI } from "../../redux/actions/UiActions";

const FranchiseTags = () => {
    const dispatch = useDispatch();
    const confirmModal = useSelector((state: RootState) => state.ui.modal === 'tag-confirm')
    const { profile } = useSelector((state: RootState) => state)
    const [selectedPlayerIndex, setSelectedPlayerIndex] = useState<number | undefined>(undefined)

    const tagPlayers = profile.owner.leagues.find(l => l.league.leagueId === profile.currentLeague?.league.leagueId)?.tagCandidates ?? []
    const theme = useTheme();

    return (
<>
<ConfirmModal 
isOpen={confirmModal} 
actionButtonLabel={'submit'} 
mainText={`Are you sure you want to tag ${tagPlayers[selectedPlayerIndex ?? 0]?.player.fullName}? You can only do this once a season and it cannot be reversed.`} 
onAction={() => console.log('pop the modal') } />
        <Card style={{ margin: 16, display: 'flex', flexDirection: 'column' }}>
            <div>
                <div style={{ display: 'flex', flexDirection: 'row', marginLeft: 8, marginRight: 8}}>
                    <div style={{ flex: 1.25 }}/>
                    <div style={{ display: 'flex', flex: 2, flexDirection: 'row', justifyContent: 'space-around' }}>
                        <div style={{ flex: 1}}>
                            <div >{`${lastYear} Salary`}</div>
                        </div>
                        <div style={{ flex: 1}}>
                            <div>Tag Price</div>
                        </div>
                    </div>
                </div>

                {tagPlayers.map((p, index) => {
                    return (
                        <TogglePlayerCardButton
                            key={p.player.mflId}
                            player={p.player}
                            attribute1={`$${p.lastSeasonSalary}` }
                            attribute2={`$${p.tagAmount ?? 0}`}
                            onSelect={() => selectedPlayerIndex === index ? setSelectedPlayerIndex(undefined) : setSelectedPlayerIndex(index)}
                            isSelected={index === selectedPlayerIndex}
                        />
                    )
                }
                )}

                {selectedPlayerIndex !== undefined &&
                    <Button style={{ backgroundColor: 'green', margin: 12 }} 
                        onClick={() => dispatch(updateUI({modal: 'tag-confirm'}))}>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                            <AttachMoneyIcon style={{ color: 'white' }} />
                            <div style={{ color: 'white' }}>FRANCHISE TAG THIS PLAYER</div>
                        </div>

                    </Button>}
            </div>
        </Card>
        </>
    );
}

export default FranchiseTags;
