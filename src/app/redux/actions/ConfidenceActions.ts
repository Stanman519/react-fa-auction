import { Action } from "@reduxjs/toolkit";
import { UPDATE_CONFIDENCE, defaultConfState } from "../reducers/ConfidenceReducer";
import { CommunityMatchupStats, ConfidencePlayerResult, ExtraPick, NflMatchup, NflPickSubmissionBody, NflTeam, PickSubmission, Prop } from "../../models/ConfidenceDTOs";
import { RootState } from "../reducers/RootReducer";
import GeneralApiSvc from "../../services/GeneralApiSvc";
import { updateUI } from "./UiActions";
import { NewMatchup } from "../../components/confidence/admin/AddMatchups";
import { User } from "@auth0/auth0-react";
import { ConfidenceWeekPointsMap } from "../../services/Common";
import { stat } from "fs";
import { useNavigate } from "react-router-dom";

export type MyPickViewMode = 'my-picks' | 'community-picks'


export interface ConfidenceState {
    viewMode: MyPickViewMode
    nflTeams?: NflTeam[],
    props: Prop[],
    matchups: NflMatchup[],
    communityStats: CommunityMatchupStats[],
    picks?: {
        demoPicks?: boolean
        savedPicks: boolean
    },
    results: ConfidencePlayerResult[]
}

export interface ConfidenceAction extends Action {
    payload: ConfidenceState
}


export const updateCofidence = (state: ConfidenceState): ConfidenceAction => {
    return { type: UPDATE_CONFIDENCE, payload: state };
}

export const getMatchups = (user: User, year: number = 2000) => async (
    dispatch: Function,
    getState: () => RootState
): Promise<any> => {
    const sub = user?.sub ?? '' // need to decide how to handle this with demo page
    dispatch(updateUI({multiLoader: [...getState().ui.multiLoader ?? [], 'con-matchups']}))
    let response = await GeneralApiSvc.getMatchups(year, sub)
    const state = getState().confidence
    let savedPicks = false
    if (response.matchups.every(m => m.pick)) {
        savedPicks = true
        response.matchups.forEach(m => {
            if (m.pick?.choice === m.left.tricode) m.chosenTeamLocal = m.left
            else if (m.pick?.choice === m.right.tricode) m.chosenTeamLocal = m.right
        })
    }

    // if matchups has picks already, set a flag to say that there's saved picks
    dispatch(updateCofidence({ ...state, matchups: response.matchups, picks: {savedPicks: savedPicks}, props: response.props }))
    dispatch(updateUI({multiLoader: [...getState().ui.multiLoader?.filter(l => l !== 'con-matchups') ?? []]}))

}


export const getError = () => async (
    dispatch: Function,
    getState: () => RootState
): Promise<any> => {
    var x = await GeneralApiSvc.getErrorTest()
    if (!x.success && typeof x.data === 'string') dispatch(updateUI({modal: 'error', errorText: x.data}))
}


export const getConfidenceResults = (year?: number) => async (
    dispatch: Function,
    getState: () => RootState
): Promise<any> => {
    dispatch(updateUI({multiLoader: [...getState().ui.multiLoader ?? [], 'con-results']}))

    let response = await GeneralApiSvc.getConfidenceResults(year ?? 2000)
    const state = getState().confidence
    if (year === -1 && state.picks?.demoPicks){
        response.push({
            displayName: 'YOU',
            ownerId: -1,
            weeklyResults: [{
                week: 1,
                //@ts-ignore
                results: state.matchups.map((m, i) => {
                    return {
                        ownerId: -1,
                        matchupId: m.id,
                        points: m.pick?.points,
                        pickTeam: {...m.pick, tricode: m.pick?.choice, name: [m.left, m.right].find(tm => tm.tricode === m.pick?.choice)?.name},
                        correct: false,
                        id: i
                }
                })
        }]
        })}
    if (year === -1 && state.picks?.demoPicks) {

        response.forEach(r => {
            var totalPoints = 0
            r.weeklyResults.forEach(w => {
                var pts = 0
                w.results.forEach(gm => {
                    const mup = state.matchups.find(m => m.id === gm.matchupId)
                    if (mup) {
                        gm.correct = gm.pickTeam?.tricode === mup.winner?.tricode
                    } 
                    if (gm.correct) pts += gm.points
                })
                w.totalPoints = pts
                totalPoints = pts
            })
            r.totalPoints = totalPoints
        })
    }
    if (year === -1){
    response.sort((a,b) => b.totalPoints - a.totalPoints)

    for (let i = 0; i < response.length; i++) {
        let totalPoints = response[i].totalPoints
        let usersWithRank = response.filter(user => user.totalPoints === totalPoints)
        usersWithRank.forEach(u => {
            u.rank = i + 1
        })
        i += usersWithRank.length - 1;
    }
}
    //res.Rank = (from s in scores where s > res.TotalPoints select s).Count() + 1;
    
    dispatch(updateCofidence({ ...state, results: response }))
    dispatch(updateUI({multiLoader: [...getState().ui.multiLoader?.filter(l => l !== 'con-results') ?? []]}))


}

export const pickTeamInMatchup = (matchup: NflMatchup, pick?: NflTeam) => async (
    dispatch: Function,
    getState: () => RootState
): Promise<any> => {
    const { confidence } = getState()
    let newMatchups = [...confidence.matchups]
    const editIndex = newMatchups.findIndex(m => m.id === matchup.id)
    if (editIndex < 0) return
    if (!pick) {
        newMatchups[editIndex].chosenTeamLocal = undefined
        dispatch(updateCofidence({...confidence, matchups: newMatchups}))
    } else {
        const newPick = [matchup.left, matchup.right].find(m => m === pick)
        if (!newPick) return
        newMatchups[editIndex].chosenTeamLocal = newPick
        dispatch(updateCofidence({...confidence, matchups: newMatchups}))
    }
}

export const setViewModeForPicks = (mode: MyPickViewMode) => async (
    dispatch: Function,
    getState: () => RootState
): Promise<any> => {
    const { confidence } = getState()
    if (mode === confidence.viewMode) return
    dispatch(updateCofidence({...confidence, viewMode: mode}))
}

export const reorderConfidenceMatchups = (sourceIndex: number, destIndex: number) => async (
    dispatch: Function,
    getState: () => RootState
): Promise<any> => {
    const { confidence } = getState()
    let result = [...confidence.matchups];
    const [removed] = result.splice(sourceIndex, 1);
    result.splice(destIndex, 0, removed);
    dispatch(updateCofidence({...confidence, matchups: result}))
}

export const makePropChoice = (propId: number, choice: 'A' | 'B') => async (
    dispatch: Function,
    getState: () => RootState
): Promise<any> => {
    const { confidence } = getState()
    const { props } = confidence
    let newProps = [...props]
    let foundIndex = newProps.findIndex(p => p.id === propId)
    if (foundIndex < 0) return
    newProps[foundIndex].localChoice = choice
    dispatch(updateCofidence({...confidence, props: newProps}))
}

export const adminAddNewMatchup = (teams: NflTeam[], matchups: NewMatchup[], week: number, year: number) => async (

): Promise<any> => {
    if (teams.length === 0 || matchups.length === 0 || week < 0 || year < 0) return

    let postBody: NflMatchup[] = matchups.map(m => {
        
    return {
        year,
        chosenTeamLocal: {},
        week,
        left: teams.find(t => t.tricode === m.left),
        right: teams.find(t => t.tricode === m.right),
        pickable: true
    } as NflMatchup })
    await GeneralApiSvc.postNewMatchups(postBody)
}

export const submitMyPicks = (locMatchups: NflMatchup[], points: number[], localProps: Prop[]) => async (
    dispatch: Function,
    getState: () => RootState
): Promise<any> => {
    const { owner } = getState().profile
    const {confidence } = getState()
    if (locMatchups.some(m => !m.chosenTeamLocal) || !owner || localProps.some(p => !p.localChoice)) return;
    dispatch(updateUI({button: 'conf-pick-submit'}))
    const submitPicks: PickSubmission[] = locMatchups.map((m, index) => {
        return {
            matchupId: m.id,
            ownerId: owner.ownerId,
            choice: m.chosenTeamLocal?.tricode ?? '',
            points: points[index]

        }
    })
    const propPicks: ExtraPick[] = localProps.map(p => {

        return {
            ownerId: owner.ownerId,
            propId: p.id ?? -1,
            choice: p.localChoice ?? 'X'
        
    }
    })
    const body: NflPickSubmissionBody = {    
        picks: submitPicks,
        props: propPicks
    }
    const response = await GeneralApiSvc.submitPicks(body)
    if (response.ok) {
        dispatch(updateUI({button: undefined, modal: 'confidence-submit-success'}))
        const {props, matchups, picks } = confidence
        let newMatchups = [...matchups]
        let newProps = [...props]
        newMatchups.forEach(m => {
            m.choice = m.chosenTeamLocal?.tricode
        })
        newProps.forEach(p => {
            const i = propPicks.findIndex(pp => pp.propId == p.id)
            if (i >= 0) p.pick = propPicks[i]
        })
        const newPicks = { savedPicks: true}
        dispatch(updateCofidence({...confidence, matchups: newMatchups, props: newProps, picks: newPicks}))
        // TODO: SET STATE TO POST SUBMISSION MODE
    }
    else {
        dispatch(updateUI({modal: 'error', errorText: 'There was a problem submitting your picks.'}))
    }

}

export const makeMatchupsUnpickable = (year?: number) => async (
    dispatch: Function,
    getState: () => RootState
): Promise<any> => {
    await GeneralApiSvc.lockAllMatchups(year)
}

export const setupAdminScreen = () => async (
    dispatch: Function,
    getState: () => RootState
): Promise<any> => {
    const { confidence } = getState()
    const response = await GeneralApiSvc.getNflTeams()
    dispatch(updateCofidence({...confidence, nflTeams: response}))
      
}

export const getCommunityStats = () => async (
    dispatch: Function,
    getState: () => RootState
): Promise<any> => {
    const { confidence } = getState()
    const {year, week} = getState().confidence.matchups[0]
    const response = await GeneralApiSvc.getCommunityStats(year, week)
    await dispatch(updateCofidence({...confidence, communityStats: response}))
    dispatch(setViewModeForPicks('community-picks'))
}

export const submitDemoPicks = (thisWeekPoints: ConfidenceWeekPointsMap) => async (
    dispatch: Function,
    getState: () => RootState
): Promise<any> => {
    const { confidence } = getState()
    const {year, week} = getState().confidence.matchups[0]
    const response = await GeneralApiSvc.getCommunityStats(year, week)
    dispatch(updateCofidence({...confidence, communityStats: response}))
    //go through demo matchups, pick a random winner, pick random prop winner, hopefully everything else just falls into place?
    const newMatchups = [...confidence.matchups]
    newMatchups.forEach((m, i) => {
        var rnd = Math.round(Math.random())
        m.winner = rnd === 1 ? m.left : m.right
        m.pickable = false
        m.choice = m.chosenTeamLocal?.tricode
        m.pick = {
            id: i,
            ownerId: -1,
            matchupId: m.id,
            choice: m.chosenTeamLocal?.tricode ?? '',
            points: thisWeekPoints.points[i]
        }
    })
    const newPicks = {...confidence.picks!, demoPicks: true}
    let newProps = confidence.props
    newProps.forEach(p => {
        p.pickable = false
        var rnd = Math.round(Math.random())
        p.winner = rnd === 1 ? "A" : "B"
        //@ts-ignore
        p.pick = {choice: p.localChoice ?? ''}
    })
    dispatch(updateCofidence({...confidence, matchups: newMatchups, picks: newPicks, props: newProps}))

 
}
export const clearConfidenceStateBeforeNav = () => async (
    dispatch: Function,
    getState: () => RootState
): Promise<any> => { 
    dispatch(updateCofidence(defaultConfState))
}



// export const setWinnerForProp = (propId: number, winningSide: string) => async (
//     dispatch: Function,
//     getState: () => RootState
// ): Promise<any> => {
//     const response = await GeneralApiSvc.setWinningProp(propId, winningSide)
// }