import { Draggable } from "@hello-pangea/dnd";
import React, { useEffect, useRef } from "react";
import { Button, Card, FormControlLabel, MenuItem, Radio, RadioGroup, Select, SelectChangeEvent } from "@mui/material";
import { ArrowDownward, ArrowUpward } from "@mui/icons-material";
import { NflTeam } from "../../../models/ConfidenceDTOs";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/reducers/RootReducer";
import GeneralApiSvc from "../../../services/GeneralApiSvc";

interface stateRadio {
    id?: number,
    value?: string
}

export const DecideMatchups = (): JSX.Element => {
    const { matchups } = useSelector((state: RootState) => state.confidence)
    const [value, setValue] = React.useState<stateRadio[]>([]);

    useEffect(() => {
        setValue(matchups.map(m => {return {id: m.id, value: m.left.tricode}}))
    }, [matchups])



    const submitWinner = async (matchupId: number) => {
        const winningTricode = value.find(m => m.id === matchupId)?.value
        if (!winningTricode) return
        await GeneralApiSvc.setWinnerForMatchup(matchupId, winningTricode);
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>, matchupId: number) => {
        var newVals = value.filter(v => v.id !== matchupId)
        setValue([...newVals, {id: matchupId, value: event.target.value}]);
      };
    return (
    <div className="flex flex-col border border-black m-6">
        <div>DECIDE MATCHUPS</div>
        {matchups?.filter(m => !m.pickable)?.map((m, i) => 
            <div key={m.id} className="rounded-sm border border-black m-1">
                <RadioGroup

                    aria-labelledby="demo-controlled-radio-buttons-group"
                    name="controlled-radio-buttons-group"
                    value={value.find(v => v.id === m.id)?.value ?? m.left.tricode}
                    onChange={(e) => handleChange(e, m.id)}
                >
                    <FormControlLabel value={m.left.tricode} control={<Radio />} label={m.left.name} />
                    <FormControlLabel value={m.right.tricode} control={<Radio />} label={m.right.name} />
                </RadioGroup>
                <Button onClick={async () => await submitWinner(m.id)}>SUBMIT</Button>
            </div>
            )}
      </div>
    )
};