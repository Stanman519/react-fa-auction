import { RootState, useAppSelector } from "../../../hooks";
import GeneralApiSvc from "../../../services/GeneralApiSvc";
import { Prop } from "../../../models/ConfidenceDTOs";
import { useAuth0 } from "@auth0/auth0-react";
import { Box, Button, FormControlLabel, Radio, RadioGroup, TextField } from "@mui/material";
import { useState } from "react";
import { AdminPanel } from "./AdminPanel";



interface PropEntries {
    prompt: string
    left: string
    right: string
}
interface stateRadio {
  id?: number,
  value?: string
}
export function PropManagement() {
    const [entries, setEntries] = useState<PropEntries>({prompt: "", left: '', right: ''})
    const [year, setYear] = useState<number>(0)
    const [week, setWeek] = useState<number>(0)
    const {props} = useAppSelector((state:RootState) => state.confidence)
    const [value, setValue] = useState<stateRadio[]>([]);
    const { user } = useAuth0();

    const uploadProp = async () => {
        if (!user?.sub) {
            alert('Please log in to upload props');
            return;
        }
        const prop: Prop = {
            year, week, prompt: entries.prompt, optionA: entries.left, optionB: entries.right, pickable: true
        }
        const body = [prop]
        await GeneralApiSvc.submitProp(body, user.sub);
    }
    const submitWinner = async (matchupId: number) => {
      if (!user?.sub) {
          alert('Please log in to submit prop results');
          return;
      }
      const winningSide = value.find(m => m.id === matchupId)?.value
      if (!winningSide) return
      await GeneralApiSvc.setWinningProp(matchupId, winningSide, user.sub);
  }
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>, matchupId: number) => {
      var newVals = value.filter(v => v.id !== matchupId)
      setValue([...newVals, {id: matchupId, value: event.target.value}]);
    };


  return (
    <AdminPanel title="Prop Management">
        <TextField id="filled-basic" label="PROMPT" variant="filled"
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setEntries({...entries, prompt: event.target.value});
          }}
        />
        <TextField id="filled-basic" label="OPTION A" variant="filled"
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setEntries({...entries, left: event.target.value});
                  }} />
        <TextField id="filled-basic" label="OPTION B" variant="filled" 
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setEntries({...entries, right: event.target.value});
                  }}/>
        <div className="flex flex-row content-between m-1 w-full">
            <TextField
            id="outlined-number"
            label="Set Week"
            type="number"
            InputLabelProps={{
                shrink: true,
            }}
            onChange={(event) => setWeek(Number.parseInt(event.target.value))}
            value={week}
            />
            <TextField
            id="outlined-number"
            label="Set Year"
            type="number"
            InputLabelProps={{
                shrink: true,
            }}
            onChange={(event) => {
                setYear(Number.parseInt(event.target.value))}}
            value={year}
            />
            <Button onClick={() => console.log('fetch props and put in state')}>See Props from this year</Button>
        </div>
        <Button disabled={(!entries.left || !entries.right || !entries.prompt)} onClick={async () => await uploadProp()}>Upload Prop</Button>


        <AdminPanel title="Decide Props" sx={{ mx: 0 }}>
        {props?.filter((m: any) => !m.pickable && m.id !== undefined)?.map((m: any, i: number) =>
            <Box key={m.id} className="m-1" sx={{ border: 1, borderColor: "divider", borderRadius: 1 }}>
                <RadioGroup

                    aria-labelledby="demo-controlled-radio-buttons-group"
                    name="controlled-radio-buttons-group"
                    value={value.find(v => v.id === m.id)?.value ?? m.optionA}
                    onChange={(e) => handleChange(e, m.id!)}
                >
                    <FormControlLabel value={"A"} control={<Radio />} label={m.optionA} />
                    <FormControlLabel value={"B"} control={<Radio />} label={m.optionB} />
                </RadioGroup>
                <Button onClick={async () => await submitWinner(m.id!)}>SUBMIT</Button>
            </Box>
            )}
      </AdminPanel>
    </AdminPanel>
  );
}
