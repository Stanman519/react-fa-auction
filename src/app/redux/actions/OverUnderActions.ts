import { Action } from "@reduxjs/toolkit";
import { FranchiseWinTotal, UPDATE_OUS } from "../reducers/OverUnderReducer";
import { RootState } from "../reducers/RootReducer";
import GeneralApiSvc, { OverUnderPick } from "../../services/GeneralApiSvc";
import { updateUI } from "./UiActions";
import Owner, { Pool } from "../reducers/OwnerReducer";

export interface OverUnderState {
  franchiseWinTotals: FranchiseWinTotal[];
  userPicks: OverUnderPick[];
  selectedLine?: number;
  otherUsers: Owner[];
  currentPool?: Pool;
  selectedUser?: Owner;
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
    dispatch(
      updateOverUnders({ ...overUnders, franchiseWinTotals: res.winLines }),
    );
  };

export const fetchUserPicks =
  () =>
  async (dispatch: Function, getState: () => RootState): Promise<any> => {
    const id = getState().overUnders.currentPool?.id;
    if (!id) return;
    const res = await GeneralApiSvc.getAllOverUnderUsersAndPicks(id);
    const { overUnders } = getState();
    const allPicks = res.flatMap((u) => u.picks);
    const allUsers = res.map((u) => u.owner);
    dispatch(
      updateOverUnders({
        ...overUnders,
        otherUsers: allUsers,
        userPicks: allPicks,
      }),
    );
  };
// export const fetchAllUsers =
//   () =>
//   async (dispatch: Function, getState: () => RootState): Promise<any> => {
//     const pool = getState().overUnders.currentPool;
//     if (!pool) return;
//     const res = await GeneralApiSvc.getAllOverUnderUsers(pool.id);
//     console.log("res", res);
//     const { overUnders } = getState();
//     dispatch(updateOverUnders({ ...overUnders, otherUsers: res }));
//   };
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
  (ownerId: number) =>
  async (dispatch: Function, getState: () => RootState): Promise<any> => {
    const overUnderState = getState().overUnders;
    const newSelectedUser = overUnderState.otherUsers.find(
      (u) => u.ownerId === ownerId,
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
