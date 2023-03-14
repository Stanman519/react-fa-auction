import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { useTheme } from '@mui/material/styles';
import { Button, Card } from '@mui/material';
import { lastYear } from "../../services/Common";
import { useState } from "react";
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { TogglePlayerCardButton } from "./TogglePlayerCardButton";

const BuyoutTile = () => {
    const dispatch = useDispatch();
    const { modal } = useSelector((state: RootState) => state.ui)
    const { profile } = useSelector((state: RootState) => state)
    const [selectedPlayerIndex, setSelectedPlayerIndex] = useState<number | undefined>(undefined)
    const theme = useTheme();
    const cutCandidates = profile.owner.leagues.find(l => l.league.leagueId === profile.currentLeague?.league.leagueId)?.cutCandidates ?? []


    return (

        <Card style={{ margin: 16, display: 'flex', flexDirection: 'column' }}>
            <div>
            <div style={{ display: 'flex', flexDirection: 'row', marginLeft: 8, marginRight: 8}}>
                    <div style={{ flex: 1.25 }}/>
                    <div style={{ display: 'flex', flex: 2, flexDirection: 'row', justifyContent: 'space-around' }}>
                        <div style={{ flex: 1}}>
                            <div>Salary</div>
                        </div>
                        <div style={{ flex: 1}}>
                            <div>Years Left</div>
                        </div>
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
            {selectedPlayerIndex != undefined &&
                <Button style={{ backgroundColor: 'green', margin: 12 }} >
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <AttachMoneyIcon style={{ color: 'white' }} />
                        <div style={{ color: 'white' }}>BUYOUT THIS PLAYER</div>
                    </div>

                </Button>}
        </Card>
    );
}

export default BuyoutTile;
