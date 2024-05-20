import { useDispatch } from "react-redux";
import { FranchiseWinTotal } from "../../../redux/reducers/OverUnderReducer";
import { Radio, RadioChangeEvent } from "antd";
import { useState } from "react";
import { Button } from "@mui/material";


export const OverUnderRow = ({prop}: {prop: FranchiseWinTotal}): JSX.Element => {

    const [select, setSelect] = useState<string>('p')
    const [adjustment, setAdjustment] = useState(0)
    const onChange = (e: RadioChangeEvent) => setSelect(e.target.value)
    const onDouble = () => {
        if (select === "p") return
        select === "o" ? setAdjustment(1) : setAdjustment(-1)
    }

    return (
        <div>
            {prop.franchise.city}
            <Radio.Group buttonStyle="solid" onChange={onChange} defaultValue="p">
            <Radio.Button value="u">Under</Radio.Button>
            <Radio.Button value="p">{prop.overUnder + adjustment}</Radio.Button>
            <Radio.Button value="o">Over</Radio.Button>
            {select !== "p" && <Button onClick={onDouble} variant="outlined">Double {select === "u" ? 'Down' : "Up"}?</Button>}
            </Radio.Group>
        </div>
    );
}