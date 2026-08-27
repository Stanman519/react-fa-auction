import { MouseEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, Popover, useMediaQuery } from "@mui/material";
import { RootState } from "../../../store";
import { OverUnderPick } from "../../../services/GeneralApiSvc";
import { seePicksForUser } from "../../../redux/actions/OverUnderActions";
import { terminal as T, fontStacks } from "../../../../theme";

type GroupKind = "under" | "pass" | "over";

interface PickGroup {
  key: string;
  kind: GroupKind;
  picks: OverUnderPick[];
}

const groupColors = (kind: GroupKind, isDouble: boolean) => {
  if (kind === "pass") return { bg: T.line, fg: T.textMute };
  if (kind === "under")
    return { bg: isDouble ? T.red : T.redDim, fg: isDouble ? "#000" : T.red };
  return { bg: isDouble ? T.lime : T.limeDim, fg: isDouble ? "#000" : T.lime };
};

export const UserPickChartForTeam = (): JSX.Element => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const dispatch = useDispatch();
  const { userPicks, selectedLine, franchiseWinTotals, otherUsers, selectedUser } =
    useSelector((state: RootState) => state.overUnders);

  const teamLine = franchiseWinTotals.find((f) => f.id === selectedLine);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setAnchorEl(null);
      setHoveredId(null);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { groups, pickSum } = useMemo(() => {
    const sorted = userPicks
      .filter((p) => p.lineId === selectedLine)
      .sort((a, b) => {
        const priority = (pick: OverUnderPick) => {
          if (pick.isOver === false) return 0;
          if (pick.isOver == null) return 1;
          return 2;
        };
        return (
          priority(a) - priority(b) || a.lineAdjustment - b.lineAdjustment
        );
      });

    const map = new Map<string, PickGroup>();
    sorted.forEach((p) => {
      if (!teamLine) return;
      const kind: GroupKind =
        p.isOver === true ? "over" : p.isOver === false ? "under" : "pass";
      const key =
        kind === "pass"
          ? "PASS"
          : `${kind === "over" ? "O" : "U"} ${teamLine.overUnder + p.lineAdjustment}`;
      if (!map.has(key)) map.set(key, { key, kind, picks: [] });
      map.get(key)!.picks.push(p);
    });

    return { groups: Array.from(map.values()), pickSum: sorted.length };
  }, [userPicks, selectedLine, teamLine]);

  const handleOpen = useCallback(
    (event: MouseEvent<HTMLElement>, pickId: number) => {
      setHoveredId(pickId);
      setAnchorEl(event.currentTarget);
    },
    [],
  );

  const handleClose = useCallback(() => {
    setHoveredId(null);
    setAnchorEl(null);
  }, []);

  const hoveredUser = useMemo(() => {
    if (hoveredId === null) return undefined;
    const pick = userPicks.find((p) => p.id === hoveredId);
    return otherUsers.find((u) => u.id === pick?.userId);
  }, [hoveredId, userPicks, otherUsers]);

  if (!teamLine || pickSum === 0) return <></>;

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
        {groups.map((g) => {
          const isDouble = g.picks.some((p) => p.lineAdjustment !== 0);
          const c = groupColors(g.kind, isDouble);
          return (
            <div
              key={g.key}
              style={{ flex: g.picks.length, minWidth: 64, maxWidth: "100%" }}
            >
              <div
                style={{
                  fontFamily: fontStacks.mono,
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  color: c.fg,
                  background: g.kind === "pass" ? "transparent" : c.bg,
                  border: `1px solid ${g.kind === "pass" ? T.line : "transparent"}`,
                  padding: "1px 4px",
                  marginBottom: 4,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {g.key} · {g.picks.length}
              </div>
              {/* Wrapped grid, not one long row — 26 users stay legible at 390px. */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {g.picks.map((pick) => {
                  const user = otherUsers.find((u) => u.id === pick.userId);
                  const isSelected = selectedUser?.id === pick.userId;
                  return (
                    <Avatar
                      key={pick.id}
                      variant="square"
                      src={user?.owner.avatar}
                      onMouseEnter={
                        !isMobile
                          ? (e: MouseEvent<HTMLElement>) =>
                              handleOpen(e, pick.id ?? 0)
                          : undefined
                      }
                      onMouseLeave={!isMobile ? handleClose : undefined}
                      onClick={(e: MouseEvent<HTMLElement>) => {
                        if (isMobile && hoveredId !== pick.id) {
                          handleOpen(e, pick.id ?? 0);
                          return;
                        }
                        dispatch(seePicksForUser(user?.id));
                        handleClose();
                      }}
                      sx={{
                        width: 18,
                        height: 18,
                        borderRadius: "2px",
                        cursor: "pointer",
                        fontSize: 9,
                        fontFamily: fontStacks.mono,
                        // Override MUI's default avatar fallback colouring.
                        background: T.panel2,
                        color: T.textDim,
                        // Whose card you're reading is the thing to make obvious:
                        // light up the selection, push everyone else back.
                        outline: isSelected
                          ? `2px solid ${T.lime}`
                          : `1px solid ${T.line}`,
                        outlineOffset: isSelected ? "-1px" : 0,
                        opacity: isSelected
                          ? 1
                          : hoveredId === pick.id
                            ? 0.9
                            : 0.4,
                        transition: "opacity 0.15s ease",
                      }}
                    >
                      {user?.owner.displayName?.[0]}
                    </Avatar>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* At-a-glance split */}
      <div style={{ display: "flex", height: 6, marginTop: 6, gap: 1 }}>
        {groups.map((g) => {
          const isDouble = g.picks.some((p) => p.lineAdjustment !== 0);
          return (
            <div
              key={g.key}
              style={{
                flex: g.picks.length,
                background: groupColors(g.kind, isDouble).bg,
              }}
            />
          );
        })}
      </div>

      {/* One popover for the whole chart instead of one per avatar. */}
      <Popover
        open={hoveredId !== null && !!anchorEl}
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        onClose={handleClose}
        disableRestoreFocus
        disableScrollLock
        sx={{
          pointerEvents: "none",
          "& .MuiPopover-paper": {
            pointerEvents: "auto",
            background: T.panel2,
            border: `1px solid ${T.lineBold}`,
            borderRadius: "3px",
          },
        }}
      >
        <div
          onClick={() => {
            dispatch(seePicksForUser(hoveredUser?.id));
            handleClose();
          }}
          style={{
            padding: "6px 10px",
            fontFamily: fontStacks.mono,
            fontSize: 10,
            letterSpacing: "0.06em",
            color: T.lime,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {hoveredUser?.owner.displayName?.toUpperCase()}'S PICKS
        </div>
      </Popover>
    </div>
  );
};

export default UserPickChartForTeam;
