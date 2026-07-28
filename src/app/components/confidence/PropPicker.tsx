import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material"
import { Prop } from "../../models/ConfidenceDTOs"
import { useDispatch, useSelector } from "react-redux"
import './animations.css'
import { useState } from "react"
import { RootState } from "../../redux/reducers/RootReducer"
import { makePropChoice } from "../../redux/actions/ConfidenceActions"
import ThumbUpOffAltIcon from '@mui/icons-material/CheckCircleOutline';
import CloseOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { terminal } from "../../../theme";

export const PropPicker = ({ prop, index, canEdit }: { prop: Prop, index: number, canEdit: boolean}) => {
    const dispatch = useDispatch()
    const choice = useSelector((state: RootState) => state.confidence.props.find(p => p.id === prop.id)?.localChoice ?? '')
    
    const getResultIcon = (src: 'A' | 'B') => {
        if (!prop.winner) return <></>
        const correct =  <ThumbUpOffAltIcon color="success" />
        const wrong = <CloseOutlinedIcon color="error" />
        if (src === 'A') {
            return prop.winner === 'A' ?  correct : wrong
        }
        else {
            return prop.winner === 'B' ?  correct : wrong
        }
    }

    return (
        <div id={'prop-container'} style={{ color: terminal.text, padding: 12 }}>
            <div className='px-2' style={{ color: terminal.text, fontSize: 14, marginBottom: 8 }}>{prop.prompt}</div>
             {canEdit ?
             <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Choose</InputLabel>
                <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={choice}
                label="Choose"
                defaultValue={''}
                onChange={(e) => {
                    if (prop.id && (e.target.value === 'A' || e.target.value === 'B')) dispatch(makePropChoice(prop.id, e.target.value))
                    }
                }>
                    <MenuItem  value={'A'}>{prop.optionA}</MenuItem>
                    <MenuItem value={'B'}>{prop.optionB}</MenuItem>
                </Select>
            </FormControl> :
            <div className="flex flex-row justify-around">
                <div>Your selection:</div>
                {prop.pick ? <div >{prop.pick.choice == 'A' ? <div className="flex flex-row content-center">{getResultIcon("A")}{prop.optionA}</div> : <div className="flex flex-row content-center">{prop.optionB}</div>}</div> : <div>Not Submitted</div>}
            </div>}
        </div>

    )

}