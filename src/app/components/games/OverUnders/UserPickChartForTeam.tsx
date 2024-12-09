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
  const dispatch = useDispatch();
  const { userPicks, selectedLine, franchiseWinTotals, otherUsers } =
    useSelector((state: RootState) => state.overUnders);

  const teamLine = franchiseWinTotals.find((f) => f.id === selectedLine);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [pickSum, setPickSum] = useState<number>(0);
  const [groupedPicks, setGroupedPicks] = useState<
    Map<string, OverUnderPick[]>
  >(new Map());

  useEffect(() => {
    const handleScroll = () => {
      setAnchorEl(null);
      setHoveredId(null);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const sorted = userPicks
      .filter((p) => p.lineId === selectedLine)
      .sort((a, b) => {
        const priority = (pick: OverUnderPick) => {
          if (pick.isOver === false) return 0;
          if (pick.isOver == null) return 1;
          if (pick.isOver === true) return 2;
          return 0;
        };
        const isOverComparison = priority(a) - priority(b);
        return isOverComparison !== 0
          ? isOverComparison
          : a.lineAdjustment - b.lineAdjustment;
      });

    const grouped = new Map<string, OverUnderPick[]>();
    setPickSum(sorted.length);

    sorted.forEach((p) => {
      if (teamLine) {
        const key =
          p.isOver === true
            ? `O ${teamLine.overUnder + p.lineAdjustment}`
            : p.isOver === false
              ? `U ${teamLine.overUnder + p.lineAdjustment}`
              : "PASS";

        if (!grouped.has(key)) {
          grouped.set(key, []);
        }
        grouped.get(key)?.push(p);
      }
    });

    setGroupedPicks(grouped);
  }, [userPicks, selectedLine, teamLine]);

  const handlePopoverOpen = useCallback(
    (event: MouseEvent<HTMLElement>, pickId: number) => {
      setHoveredId(pickId);
      setAnchorEl(event.currentTarget);
    },
    [],
  );

  const handlePopoverClose = useCallback(() => {
    setHoveredId(null);
    setAnchorEl(null);
  }, []);

  const getHeaderBgColor = useCallback((pick: OverUnderPick) => {
    if (pick.isOver === null) return "lightgray";
    if (pick.isOver === true) {
      return pick.lineAdjustment === 0 ? "#c8e6c9" : "#81c784";
    } else {
      return pick.lineAdjustment === 0 ? "#ffcccb" : "#e57373";
    }
  }, []);

  const getBgColor = useCallback((lineAdjustment: number, isOver?: boolean) => {
    if (isOver !== true && isOver !== false) return "lightgray";
    if (!isOver) {
      return lineAdjustment === 0 ? "#ffcccb" : "#e57373";
    }
    return lineAdjustment === 0 ? "#c8e6c9" : "#81c784";
  }, []);
  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-row justify-center w-full">
        {Array.from(groupedPicks.entries()).map(([key, picks]) => (
          <div
            key={key}
            className="mb-4 border-gray-400"
            style={{
              width: `${(picks.length / pickSum) * 100}%`,
              borderWidth: 1,
            }}
          >
            <Typography
              className="font-bold whitespace-nowrap  pointer-events-none"
              style={{
                backgroundColor:
                  picks.length > 0 ? getHeaderBgColor(picks[0]) : "transparent",
                textAlign: "center",
                width: "100%",
                padding: "0 8px",
              }}
            >
              {key}
            </Typography>

            <div className="flex flex-row">
              {picks.map((pick) => {
                const user = otherUsers.find((u) => u.id === pick.userId);
                return (
                  <div
                    key={pick.id}
                    onMouseEnter={
                      !isMobile
                        ? (e) => handlePopoverOpen(e, pick.id ?? 0)
                        : undefined
                    }
                    onMouseLeave={!isMobile ? handlePopoverClose : undefined}
                    onClick={
                      isMobile
                        ? (e) => handlePopoverOpen(e, pick.id ?? 0)
                        : undefined
                    }
                    className="relative border border-gray-400 box-border"
                    style={{
                      backgroundColor: getBgColor(
                        pick.lineAdjustment,
                        pick.isOver,
                      ),
                      height: 60,
                      width: `${(1 / picks.length) * 100}%`,
                    }}
                  >
                    {/* <div
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "24px",
                        height: "24px",
                        pointerEvents: "none",
                      }}
                    > */}
                    <Avatar
                      onClick={() => {
                        dispatch(seePicksForUser(user?.id));
                        handlePopoverClose();
                      }}
                      variant="square"
                      src={user?.owner.avatar}
                      style={{
                        cursor: "pointer",
                        opacity: hoveredId === pick.id ? "100%" : "60%",
                        width: "100%",
                        height: "100%",
                      }}
                    />
                    {/* </div> */}

                    <Popover
                      open={hoveredId === pick.id}
                      anchorEl={anchorEl}
                      anchorOrigin={{
                        vertical: "top",
                        horizontal: "center",
                      }}
                      transformOrigin={{
                        vertical: "bottom",
                        horizontal: "center",
                      }}
                      onClose={handlePopoverClose}
                      disableRestoreFocus
                      disableScrollLock={true}
                      keepMounted
                      sx={{
                        pointerEvents: "none",
                        "& .MuiPopover-paper": {
                          pointerEvents: "auto",
                          marginTop: "-8px",
                        },
                      }}
                    >
                      <Button
                        onClick={() => {
                          dispatch(seePicksForUser(user?.id));
                          handlePopoverClose();
                        }}
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          padding: "8px 16px",
                        }}
                        tabIndex={-1}
                      >
                        <span>{user?.owner.displayName}'s picks</span>
                      </Button>
                    </Popover>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserPickChartForTeam;
