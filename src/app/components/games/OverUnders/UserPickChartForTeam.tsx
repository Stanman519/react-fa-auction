import { MouseEvent, useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Avatar,
  Button,
  Popover,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { RootState } from "../../../store";
import { OverUnderPick } from "../../../services/GeneralApiSvc";
import { seePicksForUser } from "../../../redux/actions/OverUnderActions";

export const UserPickChartForTeam = (): JSX.Element => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const { userPicks, selectedLine, franchiseWinTotals, otherUsers } =
    useSelector((state: RootState) => state.overUnders);
  const teamLine = franchiseWinTotals.find((f) => f.id === selectedLine);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [pickSum, setPickSum] = useState<number>(0);
  const [popoverEl, setPopoverEl] = useState<HTMLDivElement | null>(null);
  const [groupedPicks, setGroupedPicks] = useState<
    Map<string, OverUnderPick[]>
  >(new Map());
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (!popoverEl?.contains(event.target as Node)) {
        handlePopoverClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [popoverEl]);

  useEffect(() => {
    const handleScroll = () => {
      setAnchorEl(null);
      setPopoverEl(null);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const sorted = userPicks
      .filter((p) => p.lineId === selectedLine)
      .sort((a, b) => {
        const priority = (pick: OverUnderPick) => {
          if (pick.isOver === false) return 0;
          if (pick.isOver == null) return 1;
          if (pick.isOver === true) return 2;
          else return 0;
        };
        const isOverComparison = priority(a) - priority(b);
        if (isOverComparison !== 0) {
          return isOverComparison;
        }
        return a.lineAdjustment - b.lineAdjustment;
      });
    const grouped = new Map<string, OverUnderPick[]>();
    setPickSum(sorted.length);
    sorted.forEach((p) => {
      if (teamLine !== undefined) {
        const key =
          p.isOver === true
            ? `O ${teamLine?.overUnder + p.lineAdjustment}`
            : p.isOver === false
              ? `U ${teamLine?.overUnder + p.lineAdjustment}`
              : "PASS";
        if (!grouped.has(key)) {
          grouped.set(key, []);
        }
        grouped.get(key)?.push(p);
      }
    });

    setGroupedPicks(grouped);
  }, [userPicks, selectedLine]);

  const handlePopoverOpen = (
    event: MouseEvent<HTMLElement>,
    pickId: number,
  ): void => {
    setAnchorEl(event.currentTarget);
    setHoveredId(pickId);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
    setHoveredId(null);
  };

  const popoverRef = useCallback((node: HTMLDivElement) => {
    if (node !== null) {
      setPopoverEl(node);
    }
  }, []);

  const getBgColor = (lineAdjustment: number, isOver?: boolean) => {
    if (isOver !== true && isOver !== false) return "lightgray";
    if (!isOver) {
      return lineAdjustment === 0 ? "#ffcccb" : "#e57373";
    }
    if (isOver) {
      return lineAdjustment === 0 ? "#c8e6c9" : "#81c784";
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
      }}
    >
      {Array.from(groupedPicks.entries()).map(([key, picks], i) => {
        return (
          <div
            key={key}
            style={{
              marginBottom: 16,
              width: `${(picks.length / pickSum) * 100}%`,
              position: "relative",
            }}
          >
            <Typography
              variant="h6"
              style={{
                pointerEvents: "none",
                position: "absolute",
                fontWeight: "700",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%) rotate(-45deg)",
                //backgroundColor: 'rgba(255, 255, 255, 0.2)',
                padding: "0 8px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                zIndex: 1,
              }}
            >
              {key}
            </Typography>
            <div style={{ display: "flex", flexDirection: "row" }}>
              {picks.map((p) => {
                const user = otherUsers.find((u) => u.id === p.userId);
                return (
                  <div
                    onMouseEnter={(e) => handlePopoverOpen(e, p.id ?? 0)}
                    onClick={
                      isMobile
                        ? (e) => handlePopoverOpen(e, p.id ?? 0)
                        : undefined
                    }
                    key={p.id}
                    style={{
                      borderStyle: "solid",
                      borderColor: "darkgray",
                      boxSizing: "border-box",
                      borderWidth: 1,
                      backgroundColor: getBgColor(p.lineAdjustment, p.isOver),
                      position: "relative",
                      height: 60,
                      width: `${(1 / picks.length) * 100}%`, // Uniform width for all rectangles
                    }}
                  >
                    <div id={`${p.id}`}></div>

                    {anchorEl && (
                      <Popover
                        sx={{
                          pointerEvents: "none",
                          zIndex: 500,
                          overflow: "visible",
                        }}
                        ref={popoverRef}
                        id={`mouse-over-popover-${p.id}`}
                        open={hoveredId === p.id}
                        anchorEl={anchorEl}
                        //@ts-ignore
                        container={anchorEl}
                        anchorOrigin={{
                          vertical: "top",
                          horizontal: "center",
                        }}
                        transformOrigin={{
                          vertical: "bottom",
                          horizontal: "center",
                        }}
                        onClose={(e, r) => {
                          handlePopoverClose();
                        }}
                        transitionDuration={0} // Disable animation
                      >
                        <div
                          style={{
                            pointerEvents: "all",
                            display: "flex",
                            flexDirection: "row",
                          }}
                        >
                          <img
                            src={user?.owner.avatar}
                            referrerPolicy="no-referrer"
                            style={{ height: 0, width: 0 }}
                          />
                          <Button
                            onClick={() => {
                              dispatch(seePicksForUser(user?.id));
                            }}
                          >
                            {" "}
                            <Avatar
                              src={user?.owner.avatar}
                              style={{ marginRight: 4 }}
                            />{" "}
                            {user?.owner.displayName}'s picks
                          </Button>
                        </div>
                      </Popover>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UserPickChartForTeam;
