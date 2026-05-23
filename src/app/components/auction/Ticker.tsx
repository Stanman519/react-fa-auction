import { Box, useTheme } from "@mui/material";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { terminal, fontStacks } from "../../../theme";
import { dfs } from "../nonAuction/terminal/tokens";
import { Headline } from "../../redux/reducers/HeadlinesReducer";
import { OwnerQuote } from "../../redux/reducers/QuotesReducer";

const TICKER_PX_PER_SEC = 60;

type TickerItem =
  | { kind: "headline"; data: Headline; createdAt: number; key: string }
  | { kind: "quote"; data: OwnerQuote; createdAt: number; key: string };

const relTime = (ms: number): string => {
  const diff = Date.now() - ms;
  if (diff < 60_000) return `${Math.max(1, Math.floor(diff / 1000))}s`;
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`;
  return `${Math.floor(diff / 86_400_000)}d`;
};

export const Ticker = () => {
  const headlinesByKey = useSelector((s: RootState) => s.headlines.byKey);
  const quotesByKey = useSelector((s: RootState) => s.quotes.byKey);
  const freeAgents = useSelector((s: RootState) => s.freeAgents);
  const lots = useSelector((s: RootState) => s.lots);
  useTheme();

  const playerLastNameById = useMemo(() => {
    const m = new Map<number, string>();
    for (const p of freeAgents) {
      if (p.mflId && p.lastName) m.set(p.mflId, p.lastName);
    }
    for (const l of lots) {
      const p = l.bid?.player;
      if (p?.mflId && p.lastName && !m.has(p.mflId)) m.set(p.mflId, p.lastName);
    }
    return m;
  }, [freeAgents, lots]);

  const items: TickerItem[] = [
    ...Object.values(headlinesByKey).map<TickerItem>((h) => ({
      kind: "headline",
      data: h,
      createdAt: new Date(h.createdAt).getTime(),
      key: `h-${h.headlineId}`,
    })),
    ...Object.values(quotesByKey).map<TickerItem>((q) => ({
      kind: "quote",
      data: q,
      createdAt: new Date(q.createdAt).getTime(),
      key: `q-${q.quoteId}`,
    })),
  ].sort((a, b) => b.createdAt - a.createdAt);

  const display: TickerItem[] = items.length
    ? items
    : [
        {
          kind: "headline",
          createdAt: Date.now(),
          key: "placeholder",
          data: {
            headlineId: 0,
            leagueId: 0,
            referenceKind: "Player",
            referenceId: 0,
            text: "awaiting headlines",
            tags: "",
            createdAt: new Date().toISOString(),
            expiresAt: null,
          },
        },
      ];

  const renderEntry = (item: TickerItem, idx: number) => {
    const isOwner =
      item.kind === "headline" && item.data.referenceKind === "Owner";
    const isQuote = item.kind === "quote";
    const glyph = isQuote ? "“" : isOwner ? "◆" : "▲";
    const glyphColor = isQuote
      ? terminal.amber
      : isOwner
        ? terminal.amber
        : terminal.lime;

    return (
      <Box
        key={`${item.key}-${idx}`}
        sx={{
          display: "inline-flex",
          alignItems: "baseline",
          gap: 0.75,
          mx: 2,
          fontFamily: fontStacks.mono,
          fontSize: dfs(11),
        }}
      >
        <Box component="span" sx={{ color: glyphColor, fontSize: dfs(10) }}>
          {glyph}
        </Box>
        {isQuote && (() => {
          const q = item.data as OwnerQuote;
          const last = playerLastNameById.get(q.playerMflId);
          return (
            <Box component="span" sx={{ color: terminal.text, fontWeight: 600 }}>
              @{q.ownerName}{last ? ` on ${last}` : ""}:
            </Box>
          );
        })()}
        <Box
          component="span"
          sx={{
            color: terminal.text,
            fontStyle: isQuote ? "italic" : "normal",
          }}
        >
          {isQuote
            ? `"${(item.data as OwnerQuote).text}"`
            : (item.data as Headline).text}
        </Box>
        <Box component="span" sx={{ color: terminal.textMute, fontSize: dfs(10) }}>
          {relTime(item.createdAt)}
        </Box>
      </Box>
    );
  };

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [durationSec, setDurationSec] = useState(60);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const measure = () => {
      const half = el.scrollWidth / 2;
      if (half > 0) {
        setDurationSec(Math.max(20, half / TICKER_PX_PER_SEC));
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [display.length]);

  return (
    <Box
      sx={{
        position: "relative",
        height: 28,
        background: "#000",
        borderBottom: `1px solid ${terminal.lineBold}`,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 2,
          px: 1.25,
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          background: terminal.lime,
          color: "#000",
          fontFamily: fontStacks.mono,
          fontWeight: 800,
          fontSize: 10,
          letterSpacing: "0.12em",
        }}
      >
        <Box
          sx={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#000",
            animation: "livePulse 1.2s ease-in-out infinite",
            "@keyframes livePulse": {
              "0%, 100%": { opacity: 1 },
              "50%": { opacity: 0.3 },
            },
          }}
        />
        WIRE
      </Box>
      <Box
        ref={scrollRef}
        sx={{
          pl: 10,
          whiteSpace: "nowrap",
          animation: `tickerScroll ${durationSec}s linear infinite`,
          "@keyframes tickerScroll": {
            "0%": { transform: "translateX(0)" },
            "100%": { transform: "translateX(-50%)" },
          },
          "@media (prefers-reduced-motion: reduce)": {
            animation: "none",
          },
        }}
      >
        {display.map(renderEntry)}
        {display.map((a, i) => renderEntry(a, i + display.length))}
      </Box>
    </Box>
  );
};
