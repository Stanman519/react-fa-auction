import { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store";
import { updateUI } from "../../../redux/actions/UiActions";
import {
  seePicksForUser,
  switchOverUnderPool,
} from "../../../redux/actions/OverUnderActions";
import { useAppThunkDispatch } from "../../../store";
import { terminal as T, fontStacks } from "../../../../theme";
import { FAChatWindow } from "../../chat";
import UserPickChartForTeam from "./UserPickChartForTeam";
import {
  getPickProgress,
  REQUIRED_DOUBLES,
  REQUIRED_PICKS,
} from "./pickStatus";
import { useIsMobile } from "../../../hooks";

const label = {
  fontFamily: fontStacks.mono,
  fontSize: 10,
  letterSpacing: "0.06em",
  color: T.textMute,
} as const;

/** Mirrors SubBarButton in menuBar.tsx — kept local so MenuBar stays prop-less. */
function OuBarButton({
  glyph,
  label: text,
  onClick,
}: {
  glyph: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: "0 12px",
        height: 32,
        display: "flex",
        alignItems: "center",
        gap: 6,
        borderLeft: `1px solid ${T.line}`,
        color: T.textDim,
        fontFamily: fontStacks.sans,
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = T.text)}
      onMouseLeave={(e) => (e.currentTarget.style.color = T.textDim)}
    >
      <span style={{ fontFamily: fontStacks.mono, fontSize: 13 }}>{glyph}</span>
      <span>{text}</span>
    </div>
  );
}

function OuChatDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  if (!mounted) return null;

  return (
    <Fragment>
      {open && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 40,
          }}
        />
      )}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 41,
          width: "40%",
          minWidth: 350,
          background: T.panel,
          borderRight: `1px solid ${T.lineBold}`,
          boxShadow: "8px 0 24px rgba(0,0,0,0.5)",
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.2s ease",
        }}
      >
        {/* "games" resolves to the pool channel — restores the O/U chat room. */}
        <FAChatWindow screen="games" />
      </div>
    </Fragment>
  );
}

export const OverUnderStickyBar = ({
  isPreseason,
}: {
  isPreseason: boolean;
}): JSX.Element => {
  const dispatch = useDispatch();
  const thunkDispatch = useAppThunkDispatch();
  const isMobile = useIsMobile(720);
  const [chatOpen, setChatOpen] = useState(false);
  const [showSeasons, setShowSeasons] = useState(false);
  const {
    franchiseWinTotals,
    currentPool,
    selectedLine,
    selectedUser,
    otherUsers,
  } = useSelector((state: RootState) => state.overUnders);
  const { owner } = useSelector((state: RootState) => state.profile);
  const myPoolUserId = otherUsers.find(
    (u) => u.owner.ownerId === owner?.ownerId,
  )?.id;

  // Test for an actual side rather than "not undefined" — a pass arrives as
  // null from the API, and null !== undefined, so the loose check counted it.
  const totalPicks = franchiseWinTotals.filter(
    (p) => p.userPick.isOver === true || p.userPick.isOver === false,
  ).length;
  const totalDoubles = franchiseWinTotals.filter(
    (p) => p.userPick.lineAdjustment !== 0,
  ).length;

  const selected = franchiseWinTotals.find((f) => f.id === selectedLine);
  const viewingOther =
    selectedUser && selectedUser.owner.ownerId !== owner?.ownerId;

  // Login returns every pool this owner has played in, newest first once sorted.
  const seasons = (owner?.pools ?? [])
    .filter((p) => p.type === "over-under-wins")
    .slice()
    .sort((a, b) => b.year - a.year);
  const newestPoolId = seasons[0]?.id;
  const isArchive = !!currentPool && currentPool.id !== newestPoolId;

  const counter = (text: string, value: string, ok: boolean) => (
    <span style={{ ...label, whiteSpace: "nowrap" }}>
      {text}{" "}
      <b
        style={{
          color: ok ? T.lime : T.red,
          fontSize: 12,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </b>
    </span>
  );

  return (
    <>
      <div
        style={{
          position: "sticky",
          // Sits directly beneath MenuBar (52 mobile / 56 desktop), which is
          // itself sticky at z-index 20. Reserves its own space — nothing
          // scrolls underneath it.
          top: isMobile ? 52 : 56,
          zIndex: 10,
          width: "100%",
          background: T.panel,
          borderBottom: `1px solid ${T.lineBold}`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            height: 40,
            paddingLeft: 12,
          }}
        >
          {/* No overflow clipping here — it would trap the switcher dropdown.
              The variable-length content gets its own clipper below. */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: isMobile ? 8 : 14,
              minWidth: 0,
            }}
          >
            {/* Season switcher — present in both modes so you can reach the
                archive from the live season and get back out again. */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div
                onClick={
                  seasons.length > 1
                    ? () => setShowSeasons((s) => !s)
                    : undefined
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "3px 6px",
                  cursor: seasons.length > 1 ? "pointer" : "default",
                  border: `1px solid ${showSeasons ? T.lineBold : "transparent"}`,
                  background: showSeasons ? T.panel2 : "transparent",
                  fontFamily: fontStacks.mono,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  color: T.text,
                  whiteSpace: "nowrap",
                }}
              >
                {currentPool?.year ?? "—"}
                {!isMobile && (
                  <span style={{ color: T.textMute, fontWeight: 400 }}>
                    NFL WIN TOTALS
                  </span>
                )}
                {seasons.length > 1 && (
                  <span style={{ fontSize: 9, color: T.textMute }}>▾</span>
                )}
              </div>

              {showSeasons && (
                <>
                  <div
                    onClick={() => setShowSeasons(false)}
                    style={{ position: "fixed", inset: 0, zIndex: 40 }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 4px)",
                      left: 0,
                      zIndex: 50,
                      minWidth: 190,
                      background: T.panel,
                      border: `1px solid ${T.lineBold}`,
                      borderRadius: 2,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                    }}
                  >
                    <div
                      style={{
                        padding: "8px 12px",
                        borderBottom: `1px solid ${T.line}`,
                        fontFamily: fontStacks.mono,
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        color: T.textMute,
                      }}
                    >
                      ● SEASONS · {seasons.length}
                    </div>
                    {seasons.map((p) => {
                      const active = p.id === currentPool?.id;
                      const isLive = p.id === newestPoolId;
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            thunkDispatch(switchOverUnderPool(p));
                            setShowSeasons(false);
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "8px 12px",
                            borderBottom: `1px solid ${T.line}`,
                            cursor: "pointer",
                            background: active ? T.panel2 : "transparent",
                          }}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: 1,
                              flexShrink: 0,
                              background: active ? T.lime : T.textMute,
                            }}
                          />
                          <span
                            style={{
                              flex: 1,
                              fontFamily: fontStacks.mono,
                              fontSize: 13,
                              fontWeight: 700,
                              color: T.text,
                            }}
                          >
                            {p.year}
                          </span>
                          <span
                            style={{
                              fontFamily: fontStacks.mono,
                              fontSize: 8,
                              fontWeight: 700,
                              letterSpacing: "0.08em",
                              color: isLive ? T.lime : T.textMute,
                              border: `1px solid ${isLive ? T.lime : T.line}`,
                              padding: "0 4px",
                            }}
                          >
                            {isLive ? "LIVE" : "FINAL"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {isArchive && (
              <span
                style={{
                  fontFamily: fontStacks.mono,
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  color: "#000",
                  background: T.amber,
                  padding: "2px 6px",
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}
              >
                ARCHIVE
              </span>
            )}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: isMobile ? 8 : 14,
                minWidth: 0,
                overflow: "hidden",
              }}
            >
            {isPreseason ? (
              <>
                {counter(
                  "PICKS",
                  `${totalPicks}/${REQUIRED_PICKS}`,
                  totalPicks === REQUIRED_PICKS,
                )}
                {counter(
                  "DOUBLES",
                  `${totalDoubles}/${REQUIRED_DOUBLES}`,
                  totalDoubles === REQUIRED_DOUBLES,
                )}
                {!isMobile && (
                  <span style={{ ...label, color: T.textMute }}>
                    CLICK THEN HOLD TO DOUBLE DOWN
                  </span>
                )}
              </>
            ) : (
              <>
                {selected && !isMobile && (
                  <span style={label}>
                    {selected.franchise.city} {selected.franchise.name} ·{" "}
                    <b style={{ color: T.textDim }}>
                      {selected.realWins}-
                      {
                        getPickProgress({
                          overUnder: selected.overUnder,
                          lineAdjustment: 0,
                          isOver: true,
                          realWins: selected.realWins,
                          gamesRemaining: selected.gamesRemaining,
                        }).losses
                      }
                    </b>
                  </span>
                )}
                {selectedUser && (
                  <span
                    onClick={
                      viewingOther && myPoolUserId !== undefined
                        ? () => dispatch(seePicksForUser(myPoolUserId))
                        : undefined
                    }
                    style={{
                      fontFamily: fontStacks.mono,
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      whiteSpace: "nowrap",
                      padding: "2px 6px",
                      cursor: viewingOther ? "pointer" : "default",
                      background: viewingOther ? T.amber : "transparent",
                      color: viewingOther ? "#000" : T.textMute,
                      border: `1px solid ${viewingOther ? T.amber : T.line}`,
                    }}
                  >
                    {viewingOther
                      ? `${selectedUser.owner.displayName.toUpperCase()}'S PICKS  ✕`
                      : "YOUR PICKS"}
                  </span>
                )}
              </>
            )}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            <OuBarButton
              glyph="◧"
              label={isMobile ? "" : "RESULTS"}
              onClick={() => dispatch(updateUI({ modal: "ou-standings" }))}
            />
            <OuBarButton
              glyph="?"
              label={isMobile ? "" : "RULES"}
              onClick={() => dispatch(updateUI({ modal: "ou-rules" }))}
            />
            <OuBarButton
              glyph="◎"
              label={isMobile ? "" : "CHAT"}
              onClick={() => setChatOpen(true)}
            />
          </div>
        </div>

        {!isPreseason && selectedLine && (
          <div
            style={{
              borderTop: `1px solid ${T.line}`,
              maxHeight: 120,
              overflowY: "auto",
              padding: "8px 12px",
            }}
          >
            <UserPickChartForTeam />
          </div>
        )}
      </div>

      <OuChatDrawer open={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
};

export default OverUnderStickyBar;
