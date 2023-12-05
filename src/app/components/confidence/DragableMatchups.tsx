import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { Skeleton, Button, Zoom } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { MatchupList } from "./MatchupList";
import { getMatchups, reorderConfidenceMatchups, submitMyPicks } from "../../redux/actions/ConfidenceActions";
import { confidencePoints } from "../../services/Common";
import React, { CSSProperties, useEffect, useState } from "react";
import { User } from "@auth0/auth0-react";
import { PropPicker } from "./PropPicker";

interface StampAnim {
    showStamp: boolean
    fadeStamp: boolean
    x: number
    y: number
}

export function DragableMatchups({user, isDemo}: {user: User | undefined, isDemo: boolean}) {
    // const [stateMatchups, setStateMatchups] = useState<NflMatchup[]>([]);
    const { matchups, picks, props } = useSelector((state: RootState) => state.confidence)
    const { multiLoader } = useSelector((state: RootState) => state.ui)
    const { owner } = useSelector((state: RootState) => state.profile)
    const dispatch = useDispatch()
    const thisWeekPoints = confidencePoints.find(cp => cp.week === matchups[0]?.week ?? 1) ?? confidencePoints[0]
    const [editMode, setEditMode] = useState<boolean>((matchups.some(m => m.pickable) && !picks?.savedPicks) || isDemo) // (matchups are pickable AND user has NOT made picks)  ----- can be set to true by edit button (only shown if pickable and user made picks)
    const [stamp, setStamp] = useState<StampAnim>({showStamp: false, fadeStamp: false, x: 0, y: 0});
    const STAMP_FONT_SIZE = 64
    const randomIntFromInterval = (min: number, max: number) => { // min and max included 
        return Math.floor(Math.random() * (max - min + 1) + min)
    }
    const EARLY_STAMP_TRANSITION_DUR = 200
    const STAMP_DURATION = 8000
    useEffect(() => {
        if (user) dispatch(getMatchups(user)) 
      },[user])
      useEffect(() => {
        if (isDemo) dispatch(getMatchups({}, -1)) 

      },[user])

      useEffect(() => {
        if ((matchups.some(m => m.pickable) && !picks?.savedPicks) || isDemo) setEditMode(true)
        if (picks?.savedPicks === true && !isDemo) setEditMode(false)
      }, [picks?.savedPicks])

    function onDragEnd(result: any) {
        if (!result.destination) {
            return;
        }
        if (result.destination.index === result.source.index) {
            return;
        }
        dispatch(reorderConfidenceMatchups(
            result.source.index,
            result.destination.index
        ));
    }
    const getStampTransform = () => {
        let rotation = randomIntFromInterval(-35, -12)
        return stamp.showStamp ?
        `rotate(${rotation}deg) scale(1)` : 
        `rotate(${rotation}deg) scale(10)`
    }

    const stampStyles: CSSProperties = {
        transition: `transform ${EARLY_STAMP_TRANSITION_DUR}ms ease-out, left ${EARLY_STAMP_TRANSITION_DUR}ms ease-out, bottom ${EARLY_STAMP_TRANSITION_DUR}ms ease-out, opacity ${EARLY_STAMP_TRANSITION_DUR}ms ease-out`,
        overflow: 'clip',
        position: 'absolute', 
        boxShadow: `2px 2px 3px black`, 
        textShadow: `2px 2px 3px black` , 
        flexWrap: 'nowrap', 
        pointerEvents: 'none',
        transform: getStampTransform(),
        opacity: stamp.fadeStamp ? 100 : 0,
        left: stamp.x, top: stamp.y, 
        zIndex: 3, fontSize: STAMP_FONT_SIZE, color: 'darkred', 
        fontWeight: 'bolder', borderColor: 'darkred', 
        borderWidth: 7, borderRadius: 14,
         paddingLeft: 6, paddingRight: 6}

    const handleStampAnim = (e: React.MouseEvent) => {
        if (editMode || stamp.showStamp) return
        var bounds = e.currentTarget.getBoundingClientRect();
        var x = e.clientX - bounds.left;
        var y = e.clientY - bounds.top;
        if ((x)/ bounds.width > .75) x = x - (0.2 * bounds.width) - (STAMP_FONT_SIZE * 2) //handles width of stamp
        if ((x) / bounds.width < .15) x = x + (0.1 * bounds.width)
        if ((y)/ bounds.height > .85) y = y - (0.2 * bounds.height) - STAMP_FONT_SIZE
        if ((y)/ bounds.height < .15) y = y + (0.1 * bounds.height)
        setStamp({showStamp: true, fadeStamp: true, x, y})
        setTimeout(() => {
            setStamp({x, y, fadeStamp: false, showStamp: true})
        }, STAMP_DURATION)
        setTimeout(() => {
            setStamp({x, y, showStamp: false, fadeStamp: false})
        }, EARLY_STAMP_TRANSITION_DUR + STAMP_DURATION)
        e.stopPropagation()
    }

    return (
        <div  className="max-w-md lg:w-1/2" style={{position: 'relative'}}>{
            multiLoader?.includes('con-matchups') ? 
                <div style={{width: '100%'}}>
                <Skeleton  variant="rectangular" width={400} style={{flex: 1, borderWidth: 1, borderColor: '#C8C8C8', margin: 2, height: 200}} />
                <Skeleton  variant="rectangular" width={400} style={{flex: 1, borderWidth: 1, borderColor: '#C8C8C8', margin: 2, height: 200}} />
                <Skeleton  variant="rectangular" width={400} style={{flex: 1, borderWidth: 1, borderColor: '#C8C8C8', margin: 2, height: 200}} />
                </div> : 
                <>
            {matchups?.length > 0 && 
            <>

            <div style={stampStyles}>LOCKED!</div>

            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="list">
                    {provided => (
                        <div ref={provided.innerRef} {...provided.droppableProps} >
                            <MatchupList onClick={(e) => handleStampAnim(e)} placeholder={provided.placeholder} matchups={matchups} thisWeekPoints={thisWeekPoints} canEdit={editMode} />

                        </div>
                    )}
                </Droppable>

            </DragDropContext>
            
            </>}
            {props.length > 0 &&
                <div className="border-slate-800 border">
                    <div>
                        <div className="text-center w-full font-bold text-lg bg-slate-800 text-white">THE EXTRA POINT TIEBREAKER</div>
                    </div>
                    {props.map((p, i) => <PropPicker key={i} prop={p} index={i} canEdit={editMode}/>)}
                </div>
            }
            {editMode && 
            <Button onClick={() => { if (!isDemo) dispatch(submitMyPicks(matchups, thisWeekPoints.points, props))}} variant="contained" 
            disabled={matchups?.some(m => !m.chosenTeamLocal) || props.some(p => !p.localChoice)}
            style={{width: '100%', height: 50}}>SUBMIT</Button>}
            {
                !editMode && matchups.some(m => m.pickable) && 
                <Button sx={{width: '100%', height: 50}} onClick={() => setEditMode(true)} variant="contained">EDIT</Button>
            }
            </>
            }

        </div>
    );
}
