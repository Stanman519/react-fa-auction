import { Draggable, DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
import React, { useEffect, useState } from "react";
import { NflMatchup } from "../../models/ConfidenceDTOs";
import {
  ConfidenceWeekPointsMap,
  confidencePoints,
} from "../../services/Common";
import { ConfidenceMatchup } from "./ConfidenceMatchup";
import { Card } from "@mui/material";
import { ArrowDownward, ArrowUpward } from "@mui/icons-material";
import { RootState } from "../../redux/reducers/RootReducer";
import { useSelector } from "react-redux";
import { terminal, fontStacks } from "../../../theme";

// Dark "slab" header shared by the PTS / PICK AND DRAG columns — mono label on a
// panel bar with a lime underline, matching the auction headers. 36px tall so the
// MORE/LESS CONFIDENT guide spacer stays aligned with the team-tile rows.
const headerSlab: React.CSSProperties = {
  width: "100%",
  height: 36,
  boxSizing: "border-box",
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
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
  borderBottom: `2px solid ${terminal.lime}`,
};

export const MatchupList = React.memo(
  ({
    matchups,
    placeholder,
    thisWeekPoints,
    canEdit,
    onClick,
    showPickAndDragHeader,
  }: {
    onClick: (e: React.MouseEvent) => void;
    matchups: NflMatchup[];
    placeholder: React.ReactNode;
    thisWeekPoints: ConfidenceWeekPointsMap | undefined;
    showPickAndDragHeader: boolean;
    canEdit: boolean;
  }): JSX.Element => {
    // const heightRef = useRef<HTMLDivElement>(null)
    const [width, setWidth] = useState<number>(window.innerWidth);
    const { communityStats } = useSelector(
      (state: RootState) => state.confidence,
    );
    function handleWindowSizeChange() {
      setWidth(window.innerWidth);
    }
    useEffect(() => {
      window.addEventListener("resize", handleWindowSizeChange);
      return () => {
        window.removeEventListener("resize", handleWindowSizeChange);
      };
    }, []);

    return (
      <div>
        <div
          onClick={(event) => onClick(event)}
          className="flex flex-row w-full"
          style={{ userSelect: "none" }}
        >
          <div
            className="flex flex-col"
            style={{
              width: 120,
              flexShrink: 0,
            }}
          >
            {matchups.every((m) => m.pickable) && (
              <div style={headerSlab}>PTS</div>
            )}
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              {(() => {
                const pts = thisWeekPoints?.points ?? [];
                const maxPts = pts.length ? Math.max(...pts) : 1;
                return pts.map((c, i) => {
                  // Conviction ramp: highest points read green, lowest read red.
                  const frac = maxPts > 1 ? (c - 1) / (maxPts - 1) : 1;
                  const hue = Math.round(130 * frac);
                  return (
                    <Card
                      id={`point-card-${i}`}
                      key={c}
                      style={{
                        flex: 1,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        background: `hsl(${hue}, 58%, 42%)`,
                        borderRadius: 6,
                        boxShadow: "none",
                      }}
                    >
                      <div
                        className="text-5xl font-extrabold"
                        style={{
                          color: "#fff",
                          textShadow: "0 1px 3px rgba(0,0,0,0.45)",
                        }}
                      >
                        {c}
                      </div>
                    </Card>
                  );
                });
              })()}
            </div>
          </div>

          {(thisWeekPoints?.points?.length ?? 0) > 2 && (
            <div className="flex flex-col">
              <div
                className="text-center w-full font-bold text-lg text-white"
                style={{
                  height: 36,
                  backgroundColor: "transparent",
                  borderTopLeftRadius: "8px",
                  borderTopRightRadius: "8px",
                }}
              ></div>
              <div
                className="flex flex-col justify-between w-8 h-full"
                style={{
                  background: `linear-gradient(180deg, ${terminal.limeDim} 0%, transparent 42%, transparent 58%, ${terminal.redDim} 100%)`,
                }}
              >
                <div
                  style={{
                    writingMode: "vertical-lr",
                    display: "flex",
                    alignItems: "center",
                    color: terminal.lime,
                    fontFamily: fontStacks.mono,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                  }}
                >
                  <ArrowUpward
                    style={{ marginBottom: 2, marginLeft: 2, fontSize: 16, color: terminal.lime }}
                  />
                  MORE CONFIDENT
                </div>
                <div
                  style={{
                    writingMode: "vertical-lr",
                    display: "flex",
                    alignItems: "center",
                    color: terminal.red,
                    fontFamily: fontStacks.mono,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                  }}
                >
                  LESS CONFIDENT
                  <ArrowDownward
                    style={{ marginBottom: 2, marginLeft: 2, fontSize: 16, color: terminal.red }}
                  />
                </div>
              </div>
            </div>
          )}
          <div className="flex flex-col" style={{ flex: 1, minWidth: 0 }}>
            {showPickAndDragHeader && (
              <div style={headerSlab}>PICK AND DRAG</div>
            )}
            {matchups.map((matchup: NflMatchup, index: number) => {
              let stats = communityStats.find(
                (s) => s.matchupId === matchup.id,
              );

              return (
                <Draggable
                  draggableId={`${matchup.id}`}
                  index={index}
                  key={matchup.id}
                  isDragDisabled={!canEdit}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <ConfidenceMatchup
                        commStats={stats}
                        isMobile={width < 769}
                        canEdit={canEdit}
                        matchup={matchup}
                        index={index}
                      />
                    </div>
                  )}
                </Draggable>
              );
            })}
            {placeholder && <div>{placeholder}</div>}
          </div>
        </div>
      </div>
    );
  },
);
