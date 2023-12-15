import { Action } from "@reduxjs/toolkit";
import { UPDATE_CONFIDENCE } from "../reducers/ConfidenceReducer";
import { ConfidencePlayerResult, ExtraPick, NflMatchup, NflPickSubmissionBody, NflTeam, PickSubmission, Prop } from "../../models/ConfidenceDTOs";
import { RootState } from "../reducers/RootReducer";
import GeneralApiSvc from "../../services/GeneralApiSvc";
import { updateUI } from "./UiActions";
import { NewMatchup } from "../../components/confidence/admin/AddMatchups";
import { User } from "@auth0/auth0-react";

export type MyPickViewMode = 'my-picks' | 'community-picks'

export interface ConfidenceState {
    viewMode: MyPickViewMode
    nflTeams?: NflTeam[],
    props: Prop[],
    matchups: NflMatchup[],
    picks?: {
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
    console.log('getMatchups')
    const sub = user?.sub ?? '' // need to decide how to handle this with demo page
    dispatch(updateUI({multiLoader: [...getState().ui.multiLoader ?? [], 'con-matchups']}))
    let response = await GeneralApiSvc.getMatchups(year, sub)
    const state = getState().confidence
    let savedPicks = false
    console.log('res', response)
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

export const getConfidenceResults = (year?: number) => async (
    dispatch: Function,
    getState: () => RootState
): Promise<any> => {
    console.log('getCon results')
    dispatch(updateUI({multiLoader: [...getState().ui.multiLoader ?? [], 'con-results']}))
    let response = await GeneralApiSvc.getConfidenceResults(year ?? 2000)
    const state = getState().confidence
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
    console.log('reorder matchups')
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
    }
    else {
        dispatch(updateUI({modal: 'error'}))
    }
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

// export const setWinnerForProp = (propId: number, winningSide: string) => async (
//     dispatch: Function,
//     getState: () => RootState
// ): Promise<any> => {
//     const response = await GeneralApiSvc.setWinningProp(propId, winningSide)
// }