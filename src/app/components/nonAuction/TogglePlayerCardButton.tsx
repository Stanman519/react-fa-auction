import { Chip,Card } from "@mui/material";
import { FreeAgent } from "../../redux/reducers/FreeAgentReducer";
import { tmColorMap, lastYear } from "../../services/Common";



interface PlayerToggleButtonProps {
    player: FreeAgent
    attribute1?: string | number
    attribute2?: string | number
    onSelect: () => void
    isSelected: boolean
}

export const TogglePlayerCardButton = ({player, attribute1, attribute2, onSelect, isSelected  }: PlayerToggleButtonProps) => {

    return (
            <Card 
            
            onClick={onSelect}
            sx={{ margin: '8px', cursor: 'pointer', display: 'flex', flexDirection: 'row', flex: 1, borderColor: 'red', borderWidth: isSelected ? '4px' : 0, borderStyle: 'solid'}} >

                <img src={player.headshot} style={{ maxHeight: '10%', maxWidth: '10%', aspectRatio: 'auto', objectFit: 'cover', marginRight: 10 }} />
                <div style={{ display: 'flex', flexDirection: 'row', flex: 1, height: 100 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: 6, paddingBottom: 6 }}>
                        <div>{player.fullName}</div>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                            <Chip label={player.position}
                                style={{ backgroundColor: tmColorMap.find(tm => tm.team === player.team)?.primary, color: 'white', alignSelf: 'center', fontSize: 14, fontWeight: 'bold', padding: 6 }} />

                            <div style={{ marginLeft: 10 }}>{player.team}</div>
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', flex: 2, alignItems: 'center' }}>
                    {attribute1 && <div>
                        <div style={{ }}>{attribute1}</div>
                    </div>}
                    {attribute2 &&<div>
                        <div style={{  }}>{attribute2}</div>
                    </div>}
                </div>



            </Card>
    );
}