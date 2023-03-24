import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { Card, Button } from '@mui/material';
import { useState } from "react";
import { TogglePlayerCardButton } from "./TogglePlayerCardButton";
import { updateUI } from "../../redux/actions/UiActions";
import { ConfirmModal } from "../ConfirmModal";
import { submitTaxiCut } from "../../redux/actions/TransactionActions";



const TaxiSquadTile = () => {
    const dispatch = useDispatch();
    const modal = useSelector((state: RootState) => state.ui.modal === 'taxi-confirm')
    const { currentLeague } = useSelector((state: RootState) => state.profile)
    const [selectedPlayerIndex, setSelectedPlayerIndex] = useState<number | undefined>(undefined)
    const taxiPlayers = currentLeague?.taxiPlayers ?? []

    return (
    <div className="m-4 flex justify-center">
    {modal && selectedPlayerIndex && selectedPlayerIndex >= 0 && taxiPlayers[selectedPlayerIndex!].salary && <ConfirmModal 
        isOpen={modal} actionButtonLabel={"SUBMIT"} 
        mainText={`Are you sure you want to cut ${taxiPlayers[selectedPlayerIndex ?? 0].fullName}?`} 
        onAction={() => dispatch(submitTaxiCut(currentLeague?.league?.leagueId ?? 0, taxiPlayers[selectedPlayerIndex!], currentLeague?.mflfranchiseid ?? 0, (taxiPlayers[selectedPlayerIndex!].salary! * 0.4 )))} />}
        <Card className="max-w-4xl flex-1">
            <div>
            <div  className="flex flex-row ml-2 mr-3 flex-1 " >
                    <div className="w-3/4 lg:w-3/5"/>
                    <div className="flex flex-col lg:flex-row w-1/4 lg:w-2/5 justify-around">
                        <div className="whitespace-nowrap text-sm lg:text-xl">FULL SALARY</div>
                        <div className="whitespace-nowrap text-sm lg:text-xl">TAXI SALARY</div>
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
            <div className="flex flex-row justify-center content-center m-3">
                <Button className="w-full" style={{ backgroundColor: 'crimson' }} 
                onClick={() => dispatch(updateUI({modal: 'taxi-confirm'}))}>
                    <div className="flex flex-row justify-center content-center pl-3 pr-4 pt-2 pb-2 ">
                        <DeleteOutlineIcon style={{ color: 'white', marginRight: 8, alignSelf: 'center' }} />
                        <div className="lg:text-2xl text-white">CUT THIS TAXI PLAYER</div>
                    </div>

                </Button>
                </div>}
        </Card>
        </div>
    )
}

export default TaxiSquadTile;