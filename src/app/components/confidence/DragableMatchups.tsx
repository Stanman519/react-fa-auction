import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { Skeleton, Button, Zoom } from "@mui/material";
import { terminal, fontStacks } from "../../../theme";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { MatchupList } from "./MatchupList";
import {
  getMatchups,
  reorderConfidenceMatchups,
  submitDemoPicks,
  submitMyPicks,
} from "../../redux/actions/ConfidenceActions";
import { confidencePoints } from "../../services/Common";
import React, { CSSProperties, useEffect, useState } from "react";
import { User } from "@auth0/auth0-react";
import { PropPicker } from "./PropPicker";
import { LoadingButton } from "@mui/lab";
import MyPicksAndStatsDropdown from "./MyPicksAndStatsDropdown";

interface StampAnim {
  showStamp: boolean;
  fadeStamp: boolean;
  x: number;
  y: number;
}

export function DragableMatchups({
  user,
  isDemo,
}: {
  user: User | undefined;
  isDemo: boolean;
}) {
  // const [stateMatchups, setStateMatchups] = useState<NflMatchup[]>([]);
  const { matchups, picks, props, viewMode } = useSelector(
    (state: RootState) => state.confidence,
  );
  const { multiLoader, button } = useSelector((state: RootState) => state.ui);
  const { owner } = useSelector((state: RootState) => state.profile);
  const dispatch = useDispatch();
  const thisWeekPoints =
    confidencePoints.find((cp) => cp.week === (matchups[0]?.week ?? 1)) ??
    confidencePoints[0];
  const [editMode, setEditMode] = useState<boolean>(
    matchups.some((m) => m.pickable) && !picks?.savedPicks,
  ); // (matchups are pickable AND user has NOT made picks)  ----- can be set to true by edit button (only shown if pickable and user made picks)
  const [stamp, setStamp] = useState<StampAnim>({
    showStamp: false,
    fadeStamp: false,
    x: 0,
    y: 0,
  });
  const STAMP_FONT_SIZE = 64;
  const randomIntFromInterval = (min: number, max: number) => {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
  };
  const EARLY_STAMP_TRANSITION_DUR = 200;
  const STAMP_DURATION = 12000;

  useEffect(() => {
    if (isDemo) {
      if (matchups.length === 0 || matchups.some((m) => m.year != -1))
        dispatch(getMatchups({}, -1));
    } else if (user && !matchups.some((m) => m.year > 0)) {
      dispatch(getMatchups(user));
    }
  }, [user, isDemo]);

  useEffect(() => {
    if (isDemo) {
      picks?.demoPicks ? setEditMode(false) : setEditMode(true);
    } else {
      if (matchups.some((m) => m.pickable) && !picks?.savedPicks)
        setEditMode(true);
      if (picks?.savedPicks) setEditMode(false);
    }
  }, [picks, picks?.savedPicks]);

  function onDragEnd(result: any) {
    if (!result.destination) {
      return;
    }
    if (result.destination.index === result.source.index) {
      return;
    }
    dispatch(
      reorderConfidenceMatchups(result.source.index, result.destination.index),
    );
  }
  const getStampTransform = () => {
    let rotation = randomIntFromInterval(-15, -5);
    return stamp.showStamp
      ? `rotate(${rotation}deg) scale(1)`
      : `rotate(${rotation}deg) scale(10)`;
  };

  const stampStyles: CSSProperties = {
    transition: `transform ${EARLY_STAMP_TRANSITION_DUR}ms ease-out, left ${EARLY_STAMP_TRANSITION_DUR}ms ease-out, bottom ${EARLY_STAMP_TRANSITION_DUR}ms ease-out, opacity ${EARLY_STAMP_TRANSITION_DUR}ms ease-out`,
    overflow: "clip",
    position: "absolute",
    boxShadow: `2px 2px 3px black`,
    textShadow: `2px 2px 3px black`,
    flexWrap: "nowrap",
    pointerEvents: "none",
    transform: getStampTransform(),
    opacity: stamp.fadeStamp ? 100 : 0,
    left: "20%",
    top: "50%",
    zIndex: 3,
    fontSize: STAMP_FONT_SIZE,
    color: "darkred",
    fontWeight: "bolder",
    // borderColor: 'darkred',
    // borderWidth: 5, borderRadius: 4,
    outline: "5px solid darkred",
    outlineOffset: -10,
    padding: 20,
    WebkitMask:
      "conic-gradient(at 32px 32px,#0000 75%,#000 0)0 0/calc(100% - 32px) calc(100% - 32px), linear-gradient(#000 0 0) content-box",
    //background: 'conic-gradient(from 90deg  at top    var(--b) left  var(--b),var(--_g)) 0    0    / var(--_p), conic-gradient(from 180deg at top    var(--b) right var(--b),var(--_g)) 100% 0    / var(--_p), conic-gradient(from 0deg   at bottom var(--b) left  var(--b),var(--_g)) 0    100% / var(--_p), conic-gradient(from -90deg at bottom var(--b) right var(--b),var(--_g)) 100% 100% / var(--_p)',
    //paddingLeft: 6, paddingRight: 6}
  };
  const handleStampAnim = (e: React.MouseEvent) => {
    if (editMode || stamp.showStamp) return;
    var bounds = e.currentTarget.getBoundingClientRect();
    var x = e.clientX - bounds.left;
    var y = e.clientY - bounds.top;
    if (x / bounds.width > 0.7)
      x = x - 0.2 * bounds.width - STAMP_FONT_SIZE * 3; //handles width of stamp
    if (x / bounds.width < 0.15) x = x + 0.1 * bounds.width;
    if (y / bounds.height > 0.85)
      y = y - 0.2 * bounds.height - STAMP_FONT_SIZE * 1.5;
    if (y / bounds.height < 0.15) y = y + 0.1 * bounds.height;
    setStamp({ showStamp: true, fadeStamp: true, x, y });
    setTimeout(() => {
      setStamp({ x, y, fadeStamp: false, showStamp: true });
    }, STAMP_DURATION);
    setTimeout(() => {
      setStamp({ x, y, showStamp: false, fadeStamp: false });
    }, EARLY_STAMP_TRANSITION_DUR + STAMP_DURATION);
    e.stopPropagation();
  };
  return (
    <div
      className="w-full lg:w-1/2 max-w-6xl overflow-x-hidden"
      style={{ position: "relative" }}
    >
      {multiLoader?.includes("con-matchups") ? (
        <div style={{ width: "100%" }}>
          <Skeleton
            variant="rectangular"
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: "#C8C8C8",
              margin: 2,
              height: 150,
            }}
          />
          <Skeleton
            variant="rectangular"
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: "#C8C8C8",
              margin: 2,
              height: 150,
            }}
          />
          <Skeleton
            variant="rectangular"
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: "#C8C8C8",
              margin: 2,
              height: 150,
            }}
          />
        </div>
      ) : (
        <>
          {matchups?.length > 0 && (
            <>
              {matchups.every((m) => !m.pickable && !m.winner) &&
                viewMode !== "community-picks" && (
                  <div style={stampStyles}>LOCKED</div>
                )}
              {matchups.some((m) => !m.pickable) ? (
                <MyPicksAndStatsDropdown />
              ) : null}
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="list">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="flex flex-col w-full overflow-x-hidden"
                      style={{ minWidth: 0 }}
                    >
                      <MatchupList
                        onClick={(e) => handleStampAnim(e)}
                        placeholder={provided.placeholder}
                        matchups={matchups}
                        thisWeekPoints={thisWeekPoints}
                        canEdit={editMode}
                        showPickAndDragHeader={matchups.every(
                          (m) => m.pickable,
                        )}
                      />
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </>
          )}
          {props.length > 0 && (
            <div
              className="w-full"
              style={{
                border: `1px solid ${terminal.lineBold}`,
                borderRadius: 8,
                overflow: "hidden",
                marginTop: 8,
                background: terminal.panel,
              }}
            >
              <div
                style={{
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: fontStacks.mono,
                  fontWeight: 700,
                  fontSize: 12,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: terminal.text,
                  background: terminal.panel2,
                  borderBottom: `2px solid ${terminal.lime}`,
                }}
              >
                THE EXTRA POINT TIEBREAKER
              </div>
              {props.map((p, i) => (
                <PropPicker key={i} prop={p} index={i} canEdit={editMode} />
              ))}
            </div>
          )}
          {editMode && (
            <LoadingButton
              id={"submit-button"}
              loading={button === "conf-pick-submit"}
              onClick={() => {
                if (!isDemo && user?.sub)
                  dispatch(
                    submitMyPicks(
                      matchups,
                      thisWeekPoints.points,
                      props,
                      user.sub,
                    ),
                  );
                else if (isDemo) dispatch(submitDemoPicks(thisWeekPoints));
              }}
              variant="contained"
              disabled={
                matchups?.some((m) => !m.chosenTeamLocal) ||
                props.some((p) => !p.localChoice) ||
                (!isDemo && !user?.sub)
              }
              style={{ width: "100%", height: 50 }}
            >
              {isDemo ? "SIMULATE GAMES" : "SUBMIT"}
            </LoadingButton>
          )}
          {!editMode && matchups.some((m) => m.pickable) && (
            <Button
              sx={{ width: "100%", height: 50 }}
              onClick={() => setEditMode(true)}
              variant="contained"
            >
              EDIT
            </Button>
          )}
        </>
      )}
    </div>
  );
}
