import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { useTheme } from '@mui/material/styles';
import { Button, Card } from '@mui/material';
import { lastYear } from "../../services/Common";
import { useState } from "react";
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { TogglePlayerCardButton } from "./TogglePlayerCardButton";
import { updateUI } from "../../redux/actions/UiActions";
import { ConfirmModal } from "../ConfirmModal";

const BuyoutTile = () => {
    const dispatch = useDispatch();
    const showModal = useSelector((state: RootState) => state.ui.modal === 'buyout-confirm')
    const { profile } = useSelector((state: RootState) => state)
    const [selectedPlayerIndex, setSelectedPlayerIndex] = useState<number | undefined>(undefined)
    const theme = useTheme();
    const cutCandidates = profile.owner.leagues.find(l => l.league.leagueId === profile.currentLeague?.league.leagueId)?.cutCandidates ?? []


    return (
<>
        {showModal && <ConfirmModal isOpen={showModal} actionButtonLabel={"SUBMIT"} mainText={"Are you sure you want to use your buyout? You only get 1 every season and it costs $15 IRL!"} onAction={() => console.log('ok')} />}
        <Card style={{ margin: 16, display: 'flex', flexDirection: 'column' }}>
            <div>
            <div  className="flex flex-row ml-2 mr-5 flex-1 " >
                    <div className="w-3/4"/>
                    <div className="flex flex-col lg:flex-row w-1/4 content-center justify-center">
                            <div className="whitespace-nowrap text-sm text-right">SALARY</div>
                            <div className="whitespace-nowrap text-sm text-right">YEARS LEFT</div>
                    </div>
                </div>
                {cutCandidates.map((p, index) => {
                    return (
                        <TogglePlayerCardButton
                            key={p.mflId}
                            player={p}
                            attribute1={`$${p.salary}`}
                            attribute2={`${p.length ?? 0}`}
                            onSelect={() => selectedPlayerIndex === index ? setSelectedPlayerIndex(undefined) : setSelectedPlayerIndex(index)}
                            isSelected={index === selectedPlayerIndex}
                        />
                    )
                })
                }

            </div>
            {selectedPlayerIndex !== undefined &&
                <Button style={{ backgroundColor: 'green', margin: 12 }} 
                onClick={() => dispatch(updateUI({modal: 'buyout-confirm'}))}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <AttachMoneyIcon style={{ color: 'white' }} />
                        <div style={{ color: 'white' }}>BUYOUT THIS PLAYER</div>
                    </div>

                </Button>}
        </Card>
        </>
    );
}

export default BuyoutTile;
