import { Chip,Card } from "@mui/material";
import { PlayerDTO } from "../../redux/reducers/FreeAgentReducer";
import { tmColorMap } from "../../services/Common";
import '../../styles/index.css'


interface PlayerToggleButtonProps {
    player: PlayerDTO
    attribute1?: string | number
    attribute2?: string | number
    onSelect: () => void
    isSelected: boolean
}

export const TogglePlayerCardButton = ({player, attribute1, attribute2, onSelect, isSelected  }: PlayerToggleButtonProps) => {

    return (
            <Card 
            
            onClick={onSelect}
            sx={{ margin: '8px', cursor: 'pointer', display: 'flex', flexDirection: 'row',  alignItems: 'center',
                flex: 1, borderColor: 'red', borderWidth: isSelected ? '4px' : 0, borderStyle: 'solid'}} >
                <div className="h-28 flex flex-row">
                    <img className="max-h-full max-w-full aspect-[150/109]" src={player.headshot}  />                    
                </div>
                <div className="flex flex-row flex-1">

                        <div className="flex flex-col w-1/2 " >
                            <div className="md:text-2xl lg:text-4xl">{player.fullName}</div>
                            <div className="flex flex-row content-center">
                                <Chip label={`${player.team} ${player.position}`}
                                    style={{ backgroundColor: tmColorMap.find(tm => tm.team === player.team)?.primary, 
                                    color: 'white', alignSelf: 'center', fontSize: 14, fontWeight: 'bold', padding: 6 }} />

                                {/* <div style={{ marginLeft: 10 }}>{}</div> */}
                            </div>

                    </div>

                    <div className="flex flex-col lg:flex-row md:text-xl lg:text-2xl leading-none flex-1 justify-around content-center">
                        {attribute1 && <div className="self-center">{attribute1}</div>}
                        {attribute2 && <div className="self-center">{attribute2}</div>}
                    </div>
                </div>





            </Card>
    );
}