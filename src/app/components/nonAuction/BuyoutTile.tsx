import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { useTheme } from '@mui/material/styles';
import { Button, Card } from '@mui/material';
import { useState } from "react";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { TogglePlayerCardButton } from "./TogglePlayerCardButton";
import { updateUI } from "../../redux/actions/UiActions";
import { ConfirmModal } from "../ConfirmModal";
import { submitBuyout } from "../../redux/actions/TransactionActions";
const BuyoutTile = () => {
    const dispatch = useDispatch();
    const showModal = useSelector((state: RootState) => state.ui.modal === 'buyout-confirm')
    const { currentLeague } = useSelector((state: RootState) => state.profile)
    const [selectedPlayerIndex, setSelectedPlayerIndex] = useState<number | undefined>(undefined)
    const theme = useTheme();
    const cutCandidates = currentLeague?.cutCandidates ?? []

    return (
        <div className="m-4 flex justify-center">
            {showModal && selectedPlayerIndex !== undefined && selectedPlayerIndex >= 0 && cutCandidates[selectedPlayerIndex!].salary &&
                <ConfirmModal isOpen={showModal} actionButtonLabel={"SUBMIT"}
                    mainText={"Are you sure you want to use your buyout? You only get 1 every season and it costs $15 IRL!"}
                    onAction={() => {
                        dispatch(submitBuyout(
                        currentLeague?.league.leagueId ?? 0, 
                        cutCandidates[selectedPlayerIndex!], 
                        currentLeague?.mflfranchiseid ?? 0, 
                        Number((Math.round(cutCandidates[selectedPlayerIndex!].salary! * 0.4 * 10) / 10).toFixed(1))
                        ))
                    }
                    } />
            }
            <Card className="max-w-4xl flex-1">
            {cutCandidates.length > 0 ? 
            <>
                <div>
                    <div className="flex flex-row ml-2 mr-3 flex-1 "  >
                        <div className="w-3/4 lg:w-3/5" />
                        <div className="flex flex-col lg:flex-row w-1/4 lg:w-2/5 justify-around">
                            <div className="whitespace-nowrap text-sm lg:text-xl">SALARY</div>
                            <div className="whitespace-nowrap text-sm lg:text-xl">YEARS LEFT</div>
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
                    <div className="flex flex-row justify-center content-center m-3" >
                        <Button className="w-full" style={{ backgroundColor: 'crimson' }}
                            onClick={() => dispatch(updateUI({ modal: 'buyout-confirm' }))}>
                            <div className="flex flex-row justify-center content-center pl-3 pr-4 pt-2 pb-2 ">
                                <DeleteOutlineIcon style={{ color: 'white', marginRight: 8, alignSelf: 'center' }} />
                                <div className="lg:text-2xl text-white">BUYOUT THIS PLAYER - 20% dead cap this year only</div>
                            </div>

                        </Button>
                    </div>}
                    </>
                : 
                <div>You used your buyout!</div>
                }
            </Card>
        </div>
    );
}

export default BuyoutTile;
