import { Draggable } from "@hello-pangea/dnd";
import React from "react";
import { NflMatchup } from "../../models/ConfidenceDTOs";
import { ConfidenceWeekPointsMap, confidencePoints } from "../../services/Common";
import { ConfidenceMatchup } from "./ConfidenceMatchup";
import { Card, useTheme } from "@mui/material";
import { ArrowDownward, ArrowUpward } from "@mui/icons-material";



export const MatchupList = React.memo(({ matchups, placeholder, thisWeekPoints, canEdit, onClick }: { onClick: (e: React.MouseEvent) => void, matchups: NflMatchup[], placeholder: React.ReactNode, thisWeekPoints: ConfidenceWeekPointsMap | undefined, canEdit: boolean }): JSX.Element => {
    // const heightRef = useRef<HTMLDivElement>(null)
    const theme = useTheme().palette
    return (
        <div onClick={(event) => onClick(event)} className="flex flex-row" style={{userSelect: 'none'}}>
            <div className="flex flex-col grow flex-1" style={{background: (thisWeekPoints && thisWeekPoints?.points.length > 1) ? 
                'linear-gradient(180deg, rgba(227,57,0,1) 0%, rgba(227,88,0,1) 20%, rgba(0,145,255,1) 76%, rgba(0,61,255,1) 100%)' : 'gray'}} >
                {thisWeekPoints?.points.map(c => (
                    <Card key={c} 
                    style={{ flex: 1, opacity: 0.5, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <div className="text-5xl font-extrabold">{c}</div>
                    </Card>
                ))}
            </div>
            {(thisWeekPoints?.points?.length ?? 0) > 1 && 
            <div className="flex flex-col justify-between w-8" >
                    <div  style={{writingMode: 'vertical-lr', display: 'flex', alignItems: 'center'}}>
                        <ArrowUpward style={{marginBottom: 2, marginLeft: 2}}/>
                        MORE CONFIDENT
                    </div>
                    <div  style={{writingMode: 'vertical-lr', display: 'flex', alignItems: 'center'}}>
                        LESS CONFIDENT
                        <ArrowDownward style={{marginBottom: 2, marginLeft: 2}}/> 
                    </div>
            </div>}
            <div className="flex flex-col">
                {matchups.map((matchup: NflMatchup, index: number) => (
                    < Draggable draggableId={`${matchup.id}`} index={index} key={matchup.id} isDragDisabled={!canEdit}>
                        {provided => (

                            <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}>
                                <ConfidenceMatchup
                                    canEdit={canEdit}
                                    matchup={matchup}
                                    index={index}
                                />
                            </div>
                        )
                        }
                    </Draggable>


                ))
                }
                {placeholder && <div>{placeholder}</div>}
            </div>
        </div>
    )
});