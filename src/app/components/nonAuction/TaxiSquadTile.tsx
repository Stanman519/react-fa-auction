import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { Card, Button } from '@mui/material';
import { useState } from "react";
import { TogglePlayerCardButton } from "./TogglePlayerCardButton";
import { updateUI } from "../../redux/actions/UiActions";
import { ConfirmModal } from "../ConfirmModal";



const TaxiSquadTile = () => {
    const dispatch = useDispatch();
    const modal = useSelector((state: RootState) => state.ui.modal === 'taxi-confirm')
    const { profile } = useSelector((state: RootState) => state)
    const [selectedPlayerIndex, setSelectedPlayerIndex] = useState<number | undefined>(undefined)
    const taxiPlayers = profile.owner.leagues.find(l => l.league.leagueId === profile.currentLeague?.league.leagueId)?.taxiPlayers ?? []

    return (
    <>
    {modal && <ConfirmModal isOpen={modal} actionButtonLabel={"SUBMIT"} mainText={`Are you sure you want to cut ${taxiPlayers[selectedPlayerIndex ?? 0].fullName}?`} onAction={() => console.log('ok')} />}
        <Card style={{ margin: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
            <div  className="flex flex-row ml-2 mr-3 flex-1 " >
                    <div className="w-3/4"/>
                    <div className="flex flex-col lg:flex-row w-1/4">
                        <div >
                            <div className="whitespace-nowrap text-sm">FULL SALARY</div>
                        </div>
                        <div >
                            <div className="whitespace-nowrap text-sm">TAXI SALARY</div>
                        </div>
                    </div>
                </div>
                {taxiPlayers.map((p, index) => {
                    return (
                        <TogglePlayerCardButton
                            key={p.mflId}
                            player={p}
                            attribute1={`$${p.salary}`}
                            attribute2={`$${((p.salary ?? 1) * 0.2).toFixed(1)}`}
                            onSelect={() => selectedPlayerIndex === index ? setSelectedPlayerIndex(undefined) : setSelectedPlayerIndex(index)}
                            isSelected={index === selectedPlayerIndex}
                        />)
                })}
            </div>
            {selectedPlayerIndex !== undefined &&
                <Button style={{ backgroundColor: 'crimson', margin: 12 }} 
                onClick={() => dispatch(updateUI({modal: 'taxi-confirm'}))}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <DeleteOutlineIcon style={{ color: 'white' }} />
                        <div style={{ color: 'white' }}>CUT THIS TAXI PLAYER</div>
                    </div>

                </Button>}
        </Card>
        </>
    )
}

export default TaxiSquadTile;