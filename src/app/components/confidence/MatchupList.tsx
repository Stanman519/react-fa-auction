import { Draggable, DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
import React, { useEffect, useState } from "react";
import { NflMatchup } from "../../models/ConfidenceDTOs";
import {
  ConfidenceWeekPointsMap,
  confidencePoints,
} from "../../services/Common";
import { ConfidenceMatchup } from "./ConfidenceMatchup";
import { Card, useTheme } from "@mui/material";
import { ArrowDownward, ArrowUpward } from "@mui/icons-material";
import { RootState } from "../../redux/reducers/RootReducer";
import { useSelector } from "react-redux";

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
    const theme = useTheme();
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
            className="flex flex-col grow "
            style={{
              minWidth: 50,
              maxWidth: 150,
            }}
          >
            {matchups.every((m) => m.pickable) && (
              <div
                className="text-center w-full font-bold text-lg text-white"
                style={{
                  backgroundColor: theme.palette.primary.main,
                  borderTopLeftRadius: "8px",
                  borderTopRightRadius: "8px",
                }}
              >
                PTS
              </div>
            )}
            <div
              style={{
                background:
                  thisWeekPoints && thisWeekPoints?.points.length > 1
                    ? "linear-gradient(180deg, rgba(227,57,0,1) 0%, rgba(227,88,0,1) 20%, rgba(0,145,255,1) 76%, rgba(0,61,255,1) 100%)"
                    : "gray",
                flex: 1,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {thisWeekPoints?.points.map((c, i) => (
                <Card
                  id={`point-card-${i}`}
                  key={c}
                  style={{
                    flex: 1,
                    opacity: 0.5,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <div className="text-5xl font-extrabold">{c}</div>
                </Card>
              ))}
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
              <div className="flex flex-col justify-between w-8 h-full">
                <div
                  style={{
                    writingMode: "vertical-lr",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <ArrowUpward style={{ marginBottom: 2, marginLeft: 2 }} />
                  MORE CONFIDENT
                </div>
                <div
                  style={{
                    writingMode: "vertical-lr",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  LESS CONFIDENT
                  <ArrowDownward style={{ marginBottom: 2, marginLeft: 2 }} />
                </div>
              </div>
            </div>
          )}
          <div className="flex flex-col">
            {showPickAndDragHeader && (
              <div
                className="text-center w-full font-bold text-lg text-white"
                style={{
                  backgroundColor: theme.palette.primary.main,
                  borderTopLeftRadius: "8px",
                  borderTopRightRadius: "8px",
                }}
              >
                PICK AND DRAG
              </div>
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
