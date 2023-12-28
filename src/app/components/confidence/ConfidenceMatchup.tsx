import { Fab, Zoom } from "@mui/material"
import { NflMatchup } from "../../models/ConfidenceDTOs"
import { pickTeamInMatchup } from "../../redux/actions/ConfidenceActions"
import { useDispatch, useSelector } from "react-redux"
import './animations.css'
import { CSSProperties, useState } from "react"
import ThumbUpOffAltIcon from '@mui/icons-material/CheckCircle';
import CloseOutlinedIcon from '@mui/icons-material/Cancel';
import { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd"
import { RootState } from "../../redux/reducers/RootReducer"
import CountUp from "react-countup"
import tinycolor from "tinycolor2";

export interface CommunityStats {
    lPct: number
    rPct: number
    lAvg: number
    rAvg: number
}



type ChevronAnim = 'left' | 'right' | undefined

export const ConfidenceMatchup = ({ matchup, index, canEdit, isMobile = false, commStats }: { matchup: NflMatchup, index: number, canEdit: boolean, isMobile: boolean, commStats?: CommunityStats }) => {
    const dispatch = useDispatch()
    const [leftChev, setLeftChev] = useState<ChevronAnim>(undefined)
    const [rightChev, setRightChev] = useState<ChevronAnim>(undefined)
    const longList = useSelector((state: RootState) => state.confidence.matchups.length > 4)
    const displayType = useSelector((state: RootState) => state.confidence.viewMode)
    // useEffect(() => {
    //     if (matchup.chosenTeamLocal) 
    // },[])
    //const teams = Array.from({length: 6}, () => [tmColorMap[Math.floor(Math.random() * 31)], tmColorMap[Math.floor(Math.random() * 31)]])
    const getTeamStyling = (origin: 'left' | 'right'): React.CSSProperties => {
        const defaultState = !matchup.chosenTeamLocal || displayType === 'community-picks'
        if (defaultState) return {
            backgroundColor: origin === 'left' ? matchup.left.primary : matchup.right.primary,
            position: 'relative',
            flexDirection: 'column',
            display: 'flex',
            height: '100%',
            width: '50%',
            transition: 'all',
            alignItems: 'center',
            overflow: 'hidden',
            transitionDuration: '0.5s',
        }
        const isPick = (origin === 'left' && matchup.chosenTeamLocal === matchup.left) || (origin === 'right' && matchup.chosenTeamLocal === matchup.right)
        return isPick ? {
            backgroundColor: origin === 'left' ? matchup.left.primary : matchup.right.primary,
            position: 'relative',
            flexDirection: 'column',
            display: 'flex',
            height: '100%',
            width: '80%',
            transition: 'all',
            alignItems: 'center',
            overflow: 'hidden',
            transitionDuration: '0.5s',
        } : {
            backgroundColor: 'gray',
            position: 'relative',
            flexDirection: 'column',
            display: 'flex',
            alignItems: 'center',
            height: '100%',
            width: '20%',
            transition: 'all',
            overflow: 'hidden',
            transitionDuration: '0.5s',
        }
    }
    const triangleL: CSSProperties =  {
        width: 0,
        height: 0,
        borderStyle: 'solid',
        borderWidth: '80px 0 0 80px',
        borderColor: 'transparent transparent transparent rgba(211,211,211,0.20)',
        transform: 'rotate(0deg)',
        bottom: 0,
        position:'absolute',
        zIndex: 1,
        left: 0
     }
    const triangleR: CSSProperties = {
        width: 0,
        height: 0,
        borderStyle: 'solid',
        borderWidth: '0 0 80px 80px',
        borderColor: 'transparent transparent rgba(211,211,211,0.20) transparent',
        transform: 'rotate(0deg)',
        bottom: 0,
        position:'absolute',
        zIndex: 1,
        right: 0
    }
    const handleChevronFiring = (origin: 'left' | 'right', dir: 'left' | 'right') => {
        if (origin === 'left') {
            setLeftChev(dir === 'left' ? 'left' : 'right')
            setTimeout(() => {
                setLeftChev(undefined)
            }, 1000)
        } else {
            setRightChev(dir === 'left' ? 'left' : 'right')
            setTimeout(() => {
                setRightChev(undefined)
            }, 1000)
        }
    }

    const getClassStringsForAnimation = (origin: 'left' | 'right') => {
        if (origin === 'left') return `${leftChev === 'left' ? 'chevron-left-active' : leftChev === 'right' ? 'chevron-right-active' : ''}`
        else return `${rightChev === 'left' ? 'chevron-left-active' : rightChev === 'right' ? 'chevron-right-active' : ''}`
    }

    const getCorrectFabName = (src: string) => {
        if ((src === 'right' && matchup.chosenTeamLocal === matchup.right) || (src === 'left' && matchup.chosenTeamLocal === matchup.left)) return 'UNDO'
        if (!matchup.chosenTeamLocal) return 'PICK'
        else return ''
    }

    const fabTransitionDuration = {
        appear: 700,
        enter: 700,
        exit: 700,
    };

    const fabs = [
        { name: 'UNDO', onPress: (origin: 'left' | 'right') => { handleChevronFiring(origin, origin === 'left' ? 'left' : 'right') } },
        { name: 'PICK', onPress: (origin: 'left' | 'right') => { handleChevronFiring(origin, origin === 'right' ? 'left' : 'right') } },
        { name: '', onPress: (origin: 'left' | 'right') => { } },
    ]
    const getLogoSize = () => {
        if (isMobile){
            return longList ? 90 : 120
        } else { 
            return 150
        }
    }
    return (
        <div id={`matchup${index}`} style={{ height: getLogoSize()*1.33, padding: 0, backgroundColor: matchup.chosenTeamLocal?.secondary, userSelect: 'none' }}
            className='flex flex-row overflow-hidden'>
            <div className={getClassStringsForAnimation('left')} style={getTeamStyling('left')}>
            <div style={{position:'absolute', bottom: 0, width: '100%', 
                height: commStats && displayType === 'community-picks' ? `${commStats?.lPct * 100}%` : '0%', 
                maxHeight: '100%',
                transitionDuration: `${commStats?.lPct}s`,
                transitionProperty: 'height',
                borderTopColor: '#CFFF06',
                borderTopWidth: commStats && displayType === 'community-picks' ? 2 : 0, backgroundColor: 'rgba(211,211,211,0.4', zIndex: 5}}>
                </div>
                {commStats && displayType === 'community-picks' && <div style={{fontSize: 40, color: '#242424',zIndex: 51, position: 'absolute', bottom: 0, left: 5, fontStyle: 'italic', fontFamily: "'Anton', sans-serif"}}><CountUp  duration={1} end={commStats.lPct * 100} />{'%'}</div>}
                <img src={matchup.left.logo}
                    style={{
                        pointerEvents: 'none', userSelect: 'none',
                        opacity: (matchup.chosenTeamLocal && matchup.chosenTeamLocal !== matchup.left && displayType === 'my-picks') ? '50%' : '100%',
                        transition: 'all', transitionDuration: '0.5s', position: 'relative',
                        minHeight: getLogoSize(), minWidth: getLogoSize(), maxHeight: getLogoSize() + 30, maxWidth: getLogoSize() + 30
                    }} />
                {(!matchup.pickable && matchup.winner && matchup.pick?.choice === matchup.left.tricode && displayType === 'my-picks') && 
                    <div>
                        <div />
                        {matchup.winner.tricode !== matchup.choice ?
                    <CloseOutlinedIcon color='error' sx={{ position: 'absolute', zIndex: 2, height: '35%', width: '35%', bottom: 0, left: 0, 
                    filter: 'drop-shadow(3px 3px 2px rgb(0 0 0 / 0.5))'}} /> :
                    <ThumbUpOffAltIcon color='success' style={{ filter: 'drop-shadow(3px 3px 2px rgb(0 0 0 / 0.5))',position: 'absolute', zIndex: 2, height: '35%', width: '35%', bottom: 0, left: 0 }} />
                    }
                    </div>}
                {canEdit && fabs.map((fab, index) => {
                    let currFab = fab.name === getCorrectFabName('left')
                    return (
                        <Zoom
                            key={fab.name}
                            in={currFab}
                            timeout={fabTransitionDuration}
                            style={{
                                transitionDelay: `${currFab ? fabTransitionDuration.enter : 0}ms`,
                            }}
                            unmountOnExit
                            mountOnEnter
                        >
                            <Fab sx={{
                                height: isMobile && longList ? 44 : undefined,
                                width: isMobile && longList ? 44 : undefined,
                                opacity: fab.name === '' ? 0 : 0.9,
                                position: 'absolute',
                                bottom: 24,
                                left: 6,
                            }} onClick={() => {
                                dispatch(pickTeamInMatchup(matchup, matchup.chosenTeamLocal === matchup.left ? undefined : matchup.left))
                                fab.onPress('left')
                            }}>{matchup.chosenTeamLocal ? (matchup.chosenTeamLocal === matchup.left ? 'UNDO' : '') : 'PICK'}</Fab>
                        </Zoom>
                    )
                })}
                {matchup.chosenTeamLocal?.tricode != matchup.right.tricode && 
                    <div style={{
                        position: 'absolute',
                        width: '100%', textAlign: 'center',
                        fontStyle: 'italic',
                        left: (matchup.chosenTeamLocal?.tricode === matchup.left.tricode && displayType === 'my-picks')? 0 : -300,
                        bottom: longList && isMobile ? 0 : 8,
                        filter: matchup.left.tertiary ? `drop-shadow(2px 1px 0px ${matchup.left.tertiary})` : 'drop-shadow(0px 0px 0px rgba(22, 22, 22, 0.8)',
                        //WebkitTextStroke: '0.25px white',
                        transition: 'ease-in',
                        transitionDuration: '0.5s', fontSize: isMobile ? 24 : 32, 
                        fontFamily: "'Anton', sans-serif", color: matchup.left.secondary, 
                        textTransform: 'uppercase'
                    }}>{matchup.left.city}</div>}
            </div>
            <div className={getClassStringsForAnimation('right')} style={getTeamStyling('right')}>
                
                <div style={{position:'absolute', bottom: 0, width: '100%', 
                height: commStats && displayType === 'community-picks' ? `${commStats?.rPct * 100}%` : '0%', 
                maxHeight: '100%',
                transitionDuration: `${commStats?.rPct}s`,
                transitionProperty: 'height',
                borderTopColor: '#CFFF06',
                borderTopWidth: commStats && displayType === 'community-picks' ? 2 : 0, backgroundColor: 'rgba(211,211,211,0.4', zIndex: 5}}>
                </div>
                {commStats && displayType === 'community-picks' && <div style={{color: '#242424', fontSize: 40, zIndex: 51, position: 'absolute', bottom: 0, right: 5, fontStyle: 'italic', fontFamily: "'Anton', sans-serif"}}><CountUp  duration={commStats.rPct} end={commStats.rPct * 100} />{'%'}</div>}
                <img src={matchup.right.logo} 
                style={{pointerEvents: 'none', 
                        opacity: (matchup.chosenTeamLocal && matchup.chosenTeamLocal !== matchup.right && displayType === 'my-picks') ? '50%' : '100%', 
                        transition: 'all', 
                        transitionDuration: `0.5s`, 
                        minHeight: getLogoSize(), minWidth: getLogoSize(), maxHeight: getLogoSize() + 30, maxWidth: getLogoSize() + 30 }} />
                {(!matchup.pickable && matchup.winner && matchup.pick?.choice === matchup.right.tricode && displayType === 'my-picks') && 
                    <div>
                        <div/>
                        {matchup.winner.tricode !== matchup.pick.choice ?
                        <CloseOutlinedIcon color='error' style={{ filter: 'drop-shadow(3px 3px 2px rgb(0 0 0 / 0.5))', position: 'absolute', zIndex: 2, height: '35%', width: '35%', bottom: 0, right: 0  }} /> :
                        <ThumbUpOffAltIcon color='success' style={{filter: 'drop-shadow(3px 3px 2px rgb(0 0 0 / 0.5))', position: 'absolute', zIndex: 2, height: '35%', width: '35%', bottom: 0, right: 0  }} />}
                    </div>}
                {canEdit && <>{fabs.map((fab, index) => {
                    let currFab = fab.name === getCorrectFabName('right')
                    return (
                        <Zoom
                            key={index}
                            in={currFab}
                            timeout={fabTransitionDuration}
                            style={{
                                transitionDelay: `${currFab ? fabTransitionDuration.enter : 0}ms`
                            }}
                            unmountOnExit
                            mountOnEnter
                        >
                            <Fab sx={{
                                 height: isMobile && longList ? 44 : undefined,
                                 width: isMobile && longList ? 44 : undefined,
                                opacity: fab.name === '' ? 0 : 0.9,
                                position: 'absolute',
                                bottom: 24,
                                right: 6,
                            }}
                                onClick={() => {
                                    dispatch(pickTeamInMatchup(matchup, matchup.chosenTeamLocal === matchup.right ? undefined : matchup.right))
                                    fab.onPress('right')
                                }}>
                                {fab.name}
                            </Fab>
                        </Zoom>
                    )
                })
                }</>}
                {matchup.chosenTeamLocal?.tricode != matchup.left.tricode &&
                    <div style={{
                        position: 'absolute',
                        width: '100%', textAlign: 'center',
                        fontStyle: 'italic',
                        left: matchup.chosenTeamLocal?.tricode === matchup.right.tricode && displayType === 'my-picks' ? 0 : 300,
                        bottom: longList && isMobile ? 0 : 8,
                        transition: 'ease-in',
                        filter: matchup.right.tertiary ? `drop-shadow(2px 1px 0px ${matchup.right.tertiary})` : 'drop-shadow(0px 0px 0px rgba(22, 22, 22, 0.8)',
                        //WebkitTextStroke: '0.25px silver',
                        transitionDuration: '0.5s', fontSize: isMobile ? 24 : 32, fontFamily: "'Anton', sans-serif", 
                        color: matchup.right.secondary, textTransform: 'uppercase'
                    }}>{matchup.right.city}</div>}
                    
            </div>
        </div>

    )

}