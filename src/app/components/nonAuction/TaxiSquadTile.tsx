import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, CircularProgress, Card, CardContent, Chip, ToggleButton, ToggleButtonGroup, Button } from '@mui/material';
import { tmColorMap } from "../../services/Common";
import StyledToggleButton from "./StyledToggleButton";
import { useState } from "react";
import { TogglePlayerCardButton } from "./TogglePlayerCardButton";



const TaxiSquadTile = () => {
    const dispatch = useDispatch();
    const { modal } = useSelector((state: RootState) => state.ui)
    const { profile } = useSelector((state: RootState) => state)
    const [selectedPlayerIndex, setSelectedPlayerIndex] = useState<number | undefined>(undefined)
    const taxiPlayers = profile.owner.leagues.find(l => l.league.leagueId === profile.currentLeague?.league.leagueId)?.taxiPlayers ?? []

    return (
        <Card style={{ margin: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
            <div style={{ display: 'flex', flexDirection: 'row', marginLeft: 8, marginRight: 8}}>
                    <div style={{ flex: 1.25 }}/>
                    <div style={{ display: 'flex', flex: 2, flexDirection: 'row', justifyContent: 'space-around' }}>
                        <div style={{ flex: 1}}>
                            <div >FULL SALARY</div>
                        </div>
                        <div style={{ flex: 1}}>
                            <div>TAXI SALARY</div>
                        </div>
                    </div>
                </div>
                {taxiPlayers.map((p, index) => {
                    return (
                        <TogglePlayerCardButton
                            key={p.mflId}
                            player={p}
                            attribute1={`$${p.salary}`}
                            attribute2={`$${p.salary ?? 1 * 0.2}`}
                            onSelect={() => selectedPlayerIndex === index ? setSelectedPlayerIndex(undefined) : setSelectedPlayerIndex(index)}
                            isSelected={index === selectedPlayerIndex}
                        />)
                })}
            </div>
            {selectedPlayerIndex &&
                <Button style={{ backgroundColor: 'crimson', margin: 12 }} >
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <DeleteOutlineIcon style={{ color: 'white' }} />
                        <div style={{ color: 'white' }}>CUT THIS TAXI PLAYER</div>
                    </div>

                </Button>}
        </Card>
    )
}

export default TaxiSquadTile;