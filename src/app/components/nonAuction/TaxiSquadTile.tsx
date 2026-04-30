import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { Box } from "@mui/material";
import { RootState } from "../../store";
import { ConfirmModal } from "../ConfirmModal";
import { updateUI } from "../../redux/actions/UiActions";
import { submitTaxiCut } from "../../redux/actions/TransactionActions";
import {
  A,
  TPanel,
  TLabel,
  TPosBadge,
  TActionButton,
  useIsMobile,
} from "./terminal";

const round1 = (n: number) => Math.round(n * 10) / 10;

const TaxiSquadTile = () => {
  const dispatch = useDispatch();
  const mobile = useIsMobile();
  const modal = useSelector((s: RootState) => s.ui.modal === "taxi-confirm");
  const { currentLeagueId } = useSelector((s: RootState) => s.profile);
  const currentLeague = useSelector((s: RootState) =>
    s.profile.owner.leagues.find((l) => l.league.leagueId === currentLeagueId),
  );
  const [selectedIdx, setSelectedIdx] = useState<number | undefined>(undefined);

  const players = currentLeague?.taxiPlayers ?? [];
  const selected = selectedIdx !== undefined ? players[selectedIdx] : undefined;

  return (
    <Box sx={{ background: A.bg, padding: mobile ? "12px" : "18px", color: A.text, minHeight: "100%" }}>
      {modal && selected?.salary && (
        <ConfirmModal
          isOpen={modal}
          actionButtonLabel="SUBMIT"
          mainText={`Are you sure you want to cut ${selected.fullName}? This cannot be reversed.`}
          onAction={() =>
            dispatch(
              submitTaxiCut(
                currentLeague?.league?.leagueId ?? 0,
                selected,
                currentLeague?.mflfranchiseid ?? 0,
                round1(selected.salary! * 0.4),
              ) as any,
            )
          }
        />
      )}

      <Box sx={{ mb: "14px" }}>
        <TLabel>FREE TAXI CUTS · NO DEAD CAP</TLabel>
        <Box sx={{ fontSize: mobile ? 20 : 24, fontWeight: 800, color: A.text, letterSpacing: "-0.02em" }}>
          Clear the squad
        </Box>
        <Box sx={{ fontSize: 12, color: A.textDim, mt: "4px" }}>
          Cut taxi players during the amnesty window with zero dead cap. Window closes when the regular season begins.
        </Box>
      </Box>

      {players.length === 0 ? (
        <TPanel sx={{ textAlign: "center", py: 4 }}>
          <Box sx={{ color: A.textDim, fontSize: 13 }}>No players on your taxi squad.</Box>
        </TPanel>
      ) : (
        <Box sx={{ mb: "14px" }}>
          <TLabel sx={{ display: "block", mb: "8px" }}>
            TAXI SQUAD · {players.length} PLAYER{players.length === 1 ? "" : "S"}
          </TLabel>
          <Box sx={{ background: A.panel, border: `1px solid ${A.line}` }}>
            {/* Header row */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: mobile ? "1fr 90px" : "auto 2fr 1fr 1fr 100px",
                columnGap: "12px",
                padding: "8px 14px",
                borderBottom: `1px solid ${A.lineBold}`,
                fontFamily: A.mono,
                fontSize: 9,
                color: A.textMute,
                letterSpacing: "0.08em",
              }}
            >
              {!mobile && <Box>POS</Box>}
              <Box>PLAYER</Box>
              {!mobile && <Box sx={{ textAlign: "right" }}>FULL SALARY</Box>}
              {!mobile && <Box sx={{ textAlign: "right" }}>TAXI HIT (20%)</Box>}
              <Box sx={{ textAlign: "right" }}>ACTION</Box>
            </Box>

            {/* Player rows */}
            {players.map((p, i) => {
              const isSelected = selectedIdx === i;
              const taxiHit = round1((p.salary ?? 0) * 0.2);
              return (
                <Box
                  key={p.mflId}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: mobile ? "1fr 90px" : "auto 2fr 1fr 1fr 100px",
                    columnGap: "12px",
                    padding: "12px 14px",
                    borderBottom: i === players.length - 1 ? "none" : `1px solid ${A.line}`,
                    fontFamily: A.mono,
                    fontSize: 12,
                    alignItems: "center",
                    background: isSelected ? A.panel2 : "transparent",
                  }}
                >
                  {!mobile && <TPosBadge pos={p.position ?? "—"} />}
                  <Box>
                    <Box sx={{ color: A.text, fontWeight: 600, fontSize: 13 }}>
                      {p.fullName}
                    </Box>
                    <Box sx={{ color: A.textDim, fontSize: 10 }}>
                      {mobile && `${p.position ?? ""} · `}
                      {p.team ?? "—"}
                      {p.age != null && `, age ${p.age}`}
                      {mobile && ` · $${p.salary}M → $${taxiHit}M taxi`}
                    </Box>
                  </Box>
                  {!mobile && (
                    <Box sx={{ textAlign: "right", color: A.text, fontWeight: 700 }}>
                      ${p.salary}M
                    </Box>
                  )}
                  {!mobile && (
                    <Box sx={{ textAlign: "right", color: A.textDim }}>
                      ${taxiHit}M
                    </Box>
                  )}
                  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <TActionButton
                      variant={isSelected ? "red" : "ghost"}
                      dense
                      onClick={() => setSelectedIdx(isSelected ? undefined : i)}
                      sx={isSelected ? {} : { color: A.red, borderColor: A.red }}
                    >
                      {isSelected ? "✓ SELECTED" : "CUT"}
                    </TActionButton>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}

      {selected && (
        <Box sx={{ mb: "20px" }}>
          <TActionButton
            variant="red"
            fullWidth
            onClick={() => dispatch(updateUI({ modal: "taxi-confirm" }))}
          >
            CUT {selected.fullName} · NO DEAD CAP
          </TActionButton>
        </Box>
      )}
    </Box>
  );
};

export default TaxiSquadTile;
