import { Accordion, AccordionSummary, AccordionDetails, Skeleton, Avatar } from "@mui/material";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import ClearIcon from '@mui/icons-material/Clear';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { getRankStringSuffix } from "../../services/Common";
import { getConfidenceResults } from "../../redux/actions/ConfidenceActions";

export function ConfidenceResultsAccordian({isDemo}: {isDemo: boolean}) {
    const { owner } = useSelector((state: RootState) => state.profile)
    const { results } = useSelector((state: RootState) => state.confidence)
    const [expanded, setExpanded] = React.useState<string | false>(false);
    const { multiLoader } = useSelector((state: RootState) => state.ui)
    const dispatch = useDispatch()

    useEffect(() => {    
        if (results.length === 0) {
            dispatch(getConfidenceResults(isDemo ? -1 : undefined))    
        }

      },[])


    const handleChange =
        (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
            setExpanded(isExpanded ? panel : false);
        };

    return (
        <div className="flex flex-col">
            {

                multiLoader?.includes('con-results')
                 ? 
                <div style={{flex: 1}}>
                <Skeleton  variant="rectangular" style={{flex: 1, margin: 10}} />
                <Skeleton  variant="rectangular" style={{flex: 1, margin: 10}} />
                <Skeleton  variant="rectangular" style={{flex: 1, margin: 10}} />
                <Skeleton  variant="rectangular" style={{flex: 1, margin: 10}} />
                <Skeleton  variant="rectangular" style={{flex: 1, margin: 10}} />
                <Skeleton  variant="rectangular" style={{flex: 1, margin: 10}} />
                </div> : 
                results.length > 0 &&


                <>
                    {results.map(r =>
                        <Accordion key={r.ownerId} expanded={expanded === `panel${r.ownerId}`} onChange={handleChange(`panel${r.ownerId}`)}>
                            <AccordionSummary

                                
                                expandIcon={r.weeklyResults.length > 0 ? <ExpandMoreIcon /> :<> </>}
                                aria-controls="panel1bh-content"
                                id="panel1bh-header"
                            >   
                            <div className="flex flex-row items-center h-full w-full">
                                <div className="text-2xl mr-2 w-1/6">{getRankStringSuffix(r.rank)}</div>
                                <img src={r?.avatar} referrerPolicy="no-referrer" style={{ height: 0, width: 0 }} />
                                <Avatar alt={r.displayName} src={r.avatar} variant="rounded"/>
                                <div className="flex flex-col justify-start mx-2">
                                    <div className="flex flex-nowrap text-lg grow leading-tight">{r.displayName}</div>
                                    {r.pickSubmitted && <div className="italic text-red-900">Picks submitted</div>}
                                </div>
                                <div style={{flex: 1, minWidth: 24}}/>
                                <div className="leading-tight mr-2 text-xl whitespace-nowrap">{r.totalPoints} pts</div> 
                            </div>
                            </AccordionSummary>
                            {r.weeklyResults.map(w =>
                                <AccordionDetails style={{paddingLeft: 4, paddingRight: 4, paddingTop: 0, paddingBottom: 0}} key={w.week}>
                                    <Accordion sx={{margin: 0}}>
                                        <AccordionSummary  sx={{paddingBottom: 0, }} expandIcon={<ExpandMoreIcon />}>
                                            <div className="flex justify-between w-full">
                                                <div className="text-lg">Week {w.week} </div>
                                                <div>{w.totalPoints} pts</div>
                                            </div>

                                        </AccordionSummary>
                                        <AccordionDetails>
                                            {w.results.map(gm =>
                                                <div className="flex row" key={gm.id}>
                                                    <div></div>
                                                    <div className="px-1.5">{gm.correct ? <ThumbUpAltIcon color="primary"/> : gm.correct === null || undefined ? <></> : <ClearIcon color="error"/> }</div>
                                                    <div>{gm.points} - {gm.pickTeam?.name ?? ''}</div> 
                                                    {!gm.pickTeam?.name && <div style={{color: 'darkgray', fontStyle: 'italic', marginLeft: 4}}>hidden</div>}
                                                    <div></div>
                                                </div>

                                            )}
                                        </AccordionDetails>
                                    </Accordion>
                                </AccordionDetails>
                            )
                            }
                        </Accordion>
                    )}

                </>

            }

        </div>)
}