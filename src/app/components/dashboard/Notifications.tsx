import { useEffect, useMemo, useState } from "react";
import { Box, Button } from "@mui/material";
import { useIsMobile } from "../nonAuction/terminal";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { ActivityItem } from "../../redux/reducers/ActivityReducer";
import {
  hydrateNotifications,
  markNotificationsRead,
} from "../../redux/actions/NotificationsActions";
import { terminal, fontStacks } from "../../../theme";

type Filter = "all" | "unread" | "bid" | "nom" | "win";

const label = {
  fontFamily: fontStacks.mono,
  fontSize: 10,
  color: terminal.textMute,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
};

const numSx = {
  fontFamily: fontStacks.mono,
  fontWeight: 700,
  fontVariantNumeric: "tabular-nums" as const,
};

const KIND_COLOR: Record<ActivityItem["kind"], string> = {
  bid: terminal.lime,
  nom: "oklch(0.68 0.15 220)",
  win: terminal.amber,
};

const relTime = (at: number): string => {
  const diff = Date.now() - at;
  if (diff < 60_000) return `${Math.max(1, Math.floor(diff / 1000))}s ago`;
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
};

const line = (a: ActivityItem): string => {
  if (a.kind === "bid")
    return `${a.ownername} bid $${a.bidSalary}M × ${a.bidLength}YR on ${a.playerName}`;
  if (a.kind === "nom") return `${a.ownername} nominated ${a.playerName}`;
  return `${a.ownername} won ${a.playerName}`;
};

export const Notifications = () => {
  const dispatch = useDispatch();
  const activity = useSelector((s: RootState) => s.activity.items);
  const lastReadAt = useSelector((s: RootState) => s.notifications.lastReadAt);
  const [filter, setFilter] = useState<Filter>("all");
  const [, setTick] = useState(0);
  const isMobile = useIsMobile();

  useEffect(() => {
    dispatch(hydrateNotifications());
  }, [dispatch]);

  // Re-render relative times every 30s
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const unreadCount = useMemo(
    () => activity.filter((a) => a.at > lastReadAt).length,
    [activity, lastReadAt],
  );

  const filtered = useMemo(() => {
    if (filter === "all") return activity;
    if (filter === "unread")
      return activity.filter((a) => a.at > lastReadAt);
    return activity.filter((a) => a.kind === filter);
  }, [activity, filter, lastReadAt]);

  return (
    <Box sx={{ background: terminal.bg, color: terminal.text, p: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 2,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Box sx={label}>Notifications</Box>
          <Box
            sx={{
              fontFamily: fontStacks.sans,
              fontSize: 18,
              fontWeight: 700,
              color: terminal.text,
            }}
          >
            {unreadCount > 0 ? `${unreadCount} Unread` : "All Caught Up"}
          </Box>
        </Box>
        <Button
          size="small"
          disabled={unreadCount === 0}
          onClick={() => dispatch(markNotificationsRead())}
          sx={{
            ml: "auto",
            fontFamily: fontStacks.mono,
            fontSize: 11,
            letterSpacing: "0.08em",
            color: terminal.lime,
            borderColor: terminal.line,
            border: `1px solid ${terminal.line}`,
            borderRadius: "2px",
            "&:hover": {
              background: terminal.panel2,
              borderColor: terminal.lime,
            },
            "&.Mui-disabled": {
              color: terminal.textMute,
              borderColor: terminal.line,
            },
          }}
        >
          Mark All Read
        </Button>
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: "4px",
          mb: 2,
          overflowX: "auto",
          py: "8px",
          mx: -2,
          px: 2,
        }}
      >
        {([
          { id: "all", label: "ALL" },
          {
            id: "unread",
            label: unreadCount > 0 ? `UNREAD (${unreadCount})` : "UNREAD",
          },
          { id: "bid", label: "BIDS" },
          { id: "nom", label: "NOMS" },
          { id: "win", label: "WINS" },
        ] as { id: Filter; label: string }[]).map((p) => {
          const on = p.id === filter;
          return (
            <Box
              key={p.id}
              component="button"
              onClick={() => setFilter(p.id)}
              sx={{
                px: "10px",
                py: "4px",
                fontFamily: fontStacks.mono,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.08em",
                border: `1px solid ${on ? terminal.lime : terminal.line}`,
                color: on ? terminal.lime : terminal.textDim,
                background: on ? terminal.limeDim : "transparent",
                borderRadius: "2px",
                cursor: "pointer",
                flexShrink: 0,
                whiteSpace: "nowrap",
              }}
            >
              {p.label}
            </Box>
          );
        })}
      </Box>

      <Box
        sx={{
          background: terminal.panel,
          border: `1px solid ${terminal.line}`,
          borderRadius: "3px",
          overflow: "hidden",
        }}
      >
        {filtered.length === 0 && (
          <Box
            sx={{
              p: 4,
              textAlign: "center",
              color: terminal.textMute,
              fontFamily: fontStacks.mono,
              fontSize: 12,
            }}
          >
            {filter === "unread"
              ? "No unread notifications."
              : "No activity yet."}
          </Box>
        )}
        {filtered.map((a) => {
          const unread = a.at > lastReadAt;
          return (
            <Box
              key={a.id}
              sx={{
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "4px 1fr auto"
                  : "4px 60px 1fr auto",
                gap: 1.25,
                alignItems: "center",
                px: 1.5,
                py: 1.25,
                borderBottom: `1px solid ${terminal.line}`,
                background: unread ? terminal.panel2 : "transparent",
                "&:last-child": { borderBottom: "none" },
              }}
            >
              <Box
                sx={{
                  width: 4,
                  height: 28,
                  background: unread ? KIND_COLOR[a.kind] : "transparent",
                  borderRadius: "1px",
                }}
              />
              {!isMobile && (
                <Box
                  sx={{
                    ...label,
                    fontSize: 9,
                    color: KIND_COLOR[a.kind],
                  }}
                >
                  {a.kind.toUpperCase()}
                </Box>
              )}
              <Box
                sx={{
                  fontFamily: fontStacks.sans,
                  fontSize: 13,
                  color: unread ? terminal.text : terminal.textDim,
                  fontWeight: unread ? 500 : 400,
                }}
              >
                {line(a)}
              </Box>
              <Box
                sx={{
                  ...numSx,
                  fontSize: 10,
                  color: terminal.textMute,
                  whiteSpace: "nowrap",
                }}
              >
                {relTime(a.at)}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default Notifications;
