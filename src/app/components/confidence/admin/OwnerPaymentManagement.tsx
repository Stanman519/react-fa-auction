import React, { useEffect, useState } from "react";
import { Button, Checkbox, FormControl, FormControlLabel, Input, TextField } from "@mui/material";
import { NflMatchup, NflTeam } from "../../../models/ConfidenceDTOs";
import GeneralApiSvc from "../../../services/GeneralApiSvc";
import { AddMatchupTeamSelector } from "./AddMatchupTeamSelector";
import { useDispatch, useSelector } from "react-redux";
import { adminAddNewMatchup, getMatchups, makeMatchupsUnpickable, setupAdminScreen } from "../../../redux/actions/ConfidenceActions";
import { MatchupList } from "../MatchupList";
import { RootState } from "../../../redux/reducers/RootReducer";
import { synchronizeAuth0WithDbLogin } from "../../../redux/actions/LoginActions";
import { useAuth0 } from "@auth0/auth0-react";
import Owner from "../../../redux/reducers/OwnerReducer";




export const OwnerPaymentManagement = (): JSX.Element => {
    const [owners, setOwners] = useState<Owner[]>([])
    const [checked, setChecked] = useState<number[]>([])
    useEffect(() => {
        const onLoad = async () => {
            const unpaid = await GeneralApiSvc.getUnpaidOwners()
            setOwners(unpaid)
        }
        onLoad()
    }, [])
    console.log('checked:', checked)
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked){
            setChecked([...checked, Number(event.target.value) ])
        }
        else {
            setChecked(checked.filter(c => c !== Number(event.target.value)))
        }
      };
    return(
        <div className="border rounded border-black flex flex-col m-3 w-1/2">
            <FormControl>
            {owners.map(o => (
                <FormControlLabel
                    key={o.ownerId}
                    control={<Checkbox onChange={handleChange}/>}
                    value={o.ownerId}
                    label={`${o.ownername} - ${o.ownerId} - ${o.displayName}`} />
                ))}
            </FormControl>
            <Button onClick={async () => {
                await GeneralApiSvc.setOwnersToPaid(checked)
                setOwners(owners.filter(o => !checked.includes(o.ownerId)))
                setChecked([])
                }}>SAVE</Button>
        </div>

    )
}