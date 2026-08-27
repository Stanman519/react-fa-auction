import { Action } from "@reduxjs/toolkit";
import { FranchiseWinTotal, UPDATE_OUS } from "../reducers/OverUnderReducer";
import { RootState } from "../reducers/RootReducer";
import GeneralApiSvc, { OverUnderPick } from "../../services/GeneralApiSvc";
import { updateUI } from "./UiActions";
import Owner, { Pool, PoolUser } from "../reducers/OwnerReducer";

export interface OverUnderState {
  franchiseWinTotals: FranchiseWinTotal[];
  userPicks: OverUnderPick[];
  selectedLine?: number;
  otherUsers: PoolUser[];
  currentPool?: Pool;
  selectedUser?: PoolUser;
}

export interface OverUnderAction extends Action {
  payload: OverUnderState;
}

export const updateOverUnders = (state: OverUnderState): OverUnderAction => {
  return { type: UPDATE_OUS, payload: state };
};

export const fetchFranchiseWinTotals =
  () =>
  async (dispatch: Function, getState: () => RootState): Promise<any> => {
    const { owner } = getState().profile;
    const pool = getState().overUnders.currentPool;
    if (!pool) return;
    const { id, year, league } = pool;
    const res = await GeneralApiSvc.getWinOverUndersForLeagueYear(
      id,
      year,
      league,
      owner.ownerId,
    );
    res.winLines.forEach((r) => {
      if (r.userPick.isOver === null) r.userPick.isOver = undefined;
    });
    const { overUnders } = getState();
    // Default the distribution chart to the first team, otherwise the results
    // page opens with an empty header and nothing hints that teams are
    // clickable. Only fills in when there's no valid selection already — so a
    // user's own choice survives, and an id left over from another season
    // (SeasonWins ids are per-year) gets replaced rather than rendering blank.
    const keepSelection =
      overUnders.selectedLine !== undefined &&
      res.winLines.some((l) => l.id === overUnders.selectedLine);
    dispatch(
      updateOverUnders({
        ...overUnders,
        franchiseWinTotals: res.winLines,
        selectedLine: keepSelection
          ? overUnders.selectedLine
          : res.winLines[0]?.id,
      }),
    );
  };

/**
 * Switch which season is being viewed. Everything else in this slice is scoped
 * to a single pool — PoolUser ids and SeasonWins ids differ per year — so it
 * all has to be cleared together or last season's ids leak into this one's
 * render. Both fetches read currentPool at call time, so they pick up the new
 * pool without needing it passed in.
 */
export const switchOverUnderPool =
  (pool: Pool) =>
  async (dispatch: Function, getState: () => RootState): Promise<any> => {
    const { overUnders } = getState();
    if (overUnders.currentPool?.id === pool.id) return;
    dispatch(
      updateOverUnders({
        ...overUnders,
        currentPool: pool,
        franchiseWinTotals: [],
        userPicks: [],
        otherUsers: [],
        selectedUser: undefined,
        selectedLine: undefined,
      }),
    );
    await dispatch(fetchFranchiseWinTotals());
    await dispatch(fetchUserPicks());
  };

export const fetchUserPicks =
  () =>
  async (dispatch: Function, getState: () => RootState): Promise<any> => {
    const id = getState().overUnders.currentPool?.id;
    const { ownerId } = getState().profile.owner;
    if (!id) return;
    const res = await GeneralApiSvc.getAllOverUnderUsersAndPicks(id);
    const { overUnders } = getState();
    const allPicks = res.flatMap((u) => u.picks);

    const allUsers = res.map((u) => u);

    const me = allUsers.find((u) => u.owner.ownerId == ownerId);

    dispatch(
      updateOverUnders({
        ...overUnders,
        otherUsers: allUsers,
        userPicks: allPicks,
        selectedUser: me,
      }),
    );
  };

export const submitOverUnderPicks =
  () =>
  async (dispatch: Function, getState: () => RootState): Promise<any> => {
    const { ownerId } = getState().profile.owner;
    const { franchiseWinTotals, currentPool } = getState().overUnders;
    if (!currentPool) return;
    const picks = franchiseWinTotals
      .map((f) => f.userPick)
      .map((p) => {
        return {
          id: p.id ?? undefined,
          lineId: p.lineId,
          userId: p.userId, // pooluserId if defined
          isOver: p.isOver ?? null,
          lineAdjustment: p.lineAdjustment,
        } as OverUnderPick;
      });
    const res = await GeneralApiSvc.sendOverUnderPicks(
      currentPool.id,
      picks,
      ownerId,
    );
    if (res.success) {
      dispatch(updateUI({ modal: "confidence-submit-success" }));
      if (!res.data || typeof res.data == "string") return;
      const newPicks: OverUnderPick[] = res.data;
      const newWinTotals = [...franchiseWinTotals];
      newWinTotals.forEach((f) => {
        const foundPick = newPicks.find((p) => p.lineId == f.id);
        if (foundPick) {
          f.userPick = foundPick;
        }
      });
      const { overUnders } = getState();
      dispatch(
        updateOverUnders({ ...overUnders, franchiseWinTotals: newWinTotals }),
      );
    } else
      dispatch(
        updateUI({
          modal: "error",
          errorText: res.errorMsg,
        }),
      );
  };

export const viewPicksForOverUnderUser =
  (userId: number) =>
  async (dispatch: Function, getState: () => RootState): Promise<any> => {
    const overUnderState = getState().overUnders;
    const newSelectedUser = overUnderState.otherUsers.find(
      (u) => u.id === userId,
    );
    if (!newSelectedUser) return;
    dispatch(
      updateOverUnders({ ...overUnderState, selectedUser: newSelectedUser }),
    );
  };

export const viewPicksForSelectedLine =
  (lineId: number) =>
  async (dispatch: Function, getState: () => RootState): Promise<any> => {
    const overUnderState = getState().overUnders;
    dispatch(updateOverUnders({ ...overUnderState, selectedLine: lineId }));
  };

export const handleOverUnderRowUpdate =
  (id: number, adj: number, isOver?: boolean) =>
  async (dispatch: Function, getState: () => RootState): Promise<any> => {
    const { overUnders } = getState();
    const newPicks = [...overUnders.franchiseWinTotals];

    if (newPicks.length === 0) return;
    const foundIndex = newPicks.findIndex((p) => p.id == id);
    if (foundIndex < 0) return;
    const oldPick = newPicks[foundIndex].userPick;
    const updatedPick = {
      ...oldPick,
      lineAdjustment: adj,
      userId: newPicks[0].userPick.userId ?? undefined,
      isOver: isOver ? true : isOver === false ? false : undefined,
      lineId: id,
    } as OverUnderPick;

    newPicks[foundIndex].userPick = updatedPick;

    dispatch(updateOverUnders({ ...overUnders, franchiseWinTotals: newPicks }));
  };

export const selectALine =
  (id: number) =>
  async (dispatch: Function, getState: () => RootState): Promise<any> => {
    const { overUnders } = getState();
    dispatch(updateOverUnders({ ...overUnders, selectedLine: id }));
  };

export const seePicksForUser =
  (userId?: number) =>
  async (dispatch: Function, getState: () => RootState): Promise<any> => {
    const { overUnders } = getState();
    const currentPoolId = overUnders.currentPool?.id;
    if (currentPoolId === undefined || userId === undefined) return;
    const newSelectedUser = overUnders.otherUsers.find((u) => u.id === userId);
    if (newSelectedUser)
      dispatch(
        updateOverUnders({ ...overUnders, selectedUser: newSelectedUser }),
      );
  };
