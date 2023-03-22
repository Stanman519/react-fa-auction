import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { useTheme } from '@mui/material/styles';
import { Button, Card } from '@mui/material';
import { lastYear } from "../../services/Common";
import { useState } from "react";
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
        <div className="m-4">
            {confirmModal && <ConfirmModal
                isOpen={confirmModal}
                actionButtonLabel={'submit'}
                mainText={`Are you sure you want to tag ${tagPlayers[selectedPlayerIndex ?? 0]?.player.fullName}? You can only do this once a season and it cannot be reversed.`}
                onAction={() => console.log('pop the modal')} />}
            <Card >
                <div className="flex flex-col">
                    <div className="flex flex-row ml-2 mr-3 flex-1 ">
                        <div className="w-3/4"/>
                        <div className="flex flex-row w-1/4 justify-center">
                            <div className=" " >
                                <div>TAG PRICE</div>
                            </div>
                        </div>
                    </div>

                    {tagPlayers.map((p, index) => {
                        return (
                            <TogglePlayerCardButton
                                key={p.player.mflId}
                                player={p.player}
                                // attribute1={`$${p.lastSeasonSalary}`}
                                attribute2={`$${p.tagAmount ?? 0}`}
                                onSelect={() => selectedPlayerIndex === index ? setSelectedPlayerIndex(undefined) : setSelectedPlayerIndex(index)}
                                isSelected={index === selectedPlayerIndex}
                            />
                        )
                    }
                    )}

                    {selectedPlayerIndex !== undefined &&
                    <div className="flex flex-row justify-center content-center m-3" >
                        <Button className="" style={{ backgroundColor: 'green' }}
                            onClick={() => dispatch(updateUI({ modal: 'tag-confirm' }))}>
                            <div className="flex flex-row justify-center content-center" >
                                <AttachMoneyIcon style={{ color: 'white' }} />
                                <div style={{ color: 'white' }}>FRANCHISE TAG THIS PLAYER</div>
                            </div>

                        </Button>
                        </div>}
                </div>
            </Card>
        </div>
    );
}

export default FranchiseTags;
