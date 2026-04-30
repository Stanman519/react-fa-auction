import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { Box } from "@mui/material";
import { RootState } from "../../store";
import { ConfirmModal } from "../ConfirmModal";
import { updateUI } from "../../redux/actions/UiActions";
import { submitBuyout } from "../../redux/actions/TransactionActions";
import { PlayerDTO } from "../../redux/reducers/FreeAgentReducer";
import {
  A,
  dfs,
  TPanel,
  TLabel,
  TPosBadge,
  TActionButton,
  useIsMobile,
} from "./terminal";

const DEAD_CAP_RATE = 0.2; // amnesty buyout = 20% (vs normal 40%)

const round1 = (n: number) => Math.round(n * 10) / 10;

function CandidateCard({
  player,
  selected,
  mobile,
  onSelect,
}: {
  player: PlayerDTO;
  selected: boolean;
  mobile: boolean;
  onSelect: () => void;
}) {
  const salary = player.salary ?? 0;
  const years = player.length ?? 0;
  const deadCap = round1(salary * years * DEAD_CAP_RATE);
  const netSavings = round1((years * salary * 0.4) - (salary * 0.2));
  const nextYear = new Date().getFullYear() + 1;

  return (
    <Box
      sx={{
        background: A.panel,
        border: `1px solid ${selected ? A.red : A.line}`,
        mb: "12px",
      }}
    >
      <Box
        sx={{
          padding: mobile ? "10px 12px" : "12px 16px",
          borderBottom: `1px solid ${A.line}`,
          display: "flex",
          alignItems: "center",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <TPosBadge pos={player.position ?? "POS"} />
        <Box sx={{ fontSize: mobile ? 15 : dfs(16), fontWeight: 700, color: A.text }}>
          {player.fullName}
        </Box>
        <Box sx={{ color: A.textDim, fontFamily: A.mono, fontSize: dfs(11) }}>
          · {player.team ?? "—"}
          {player.age != null && `, age ${player.age}`}
        </Box>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(4, 1fr)",
          gap: "1px",
          background: A.line,
        }}
      >
        {[
          { label: "CURRENT SALARY", value: `$${salary}M`, tone: A.lime },
          { label: "YEARS REMAINING", value: `${years} YRS`, tone: A.text },
          { label: `DEAD CAP · ${nextYear}`, value: `$${deadCap}M`, tone: A.amber },
          { label: "NET SAVINGS", value: `$${netSavings}M`, tone: netSavings > 0 ? A.lime : A.red },
        ].map((c) => (
          <Box key={c.label} sx={{ background: A.panel, padding: "12px 14px" }}>
            <TLabel>{c.label}</TLabel>
            <Box
              sx={{
                fontSize: dfs(20),
                fontWeight: 800,
                color: c.tone,
                fontFamily: A.mono,
                lineHeight: 1,
                mt: "4px",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {c.value}
            </Box>
          </Box>
        ))}
      </Box>

      <Box
        sx={{
          padding: mobile ? "10px 12px" : "12px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <Box sx={{ fontFamily: A.mono, fontSize: dfs(10), color: A.textDim }}>
          ${DEAD_CAP_RATE * 100}% dead cap, next year only · costs $15 IRL
        </Box>
        <TActionButton
          variant={selected ? "red" : "ghost"}
          onClick={onSelect}
          sx={selected ? {} : { color: A.red, borderColor: A.red }}
        >
          {selected ? "✓ SELECTED" : "BUYOUT →"}
        </TActionButton>
      </Box>
    </Box>
  );
}

export default function BuyoutTileTerminal() {
  const dispatch = useDispatch();
  const mobile = useIsMobile();
  const showModal = useSelector((s: RootState) => s.ui.modal === "buyout-confirm");
  const { currentLeagueId } = useSelector((s: RootState) => s.profile);
  const currentLeague = useSelector((s: RootState) =>
    s.profile.owner.leagues.find((l) => l.league.leagueId === currentLeagueId),
  );
  const [selectedIdx, setSelectedIdx] = useState<number | undefined>(undefined);

  const candidates = currentLeague?.cutCandidates;
  const selected = selectedIdx !== undefined && candidates ? candidates[selectedIdx] : undefined;

  return (
    <Box sx={{ background: A.bg, padding: mobile ? "12px" : "18px", color: A.text, minHeight: "100%" }}>
      {showModal && selected?.salary && (
        <ConfirmModal
          isOpen={showModal}
          actionButtonLabel="SUBMIT"
          mainText="Are you sure you want to use your buyout? You only get 1 every season and it costs $15 IRL!"
          onAction={() =>
            dispatch(
              submitBuyout(
                currentLeague?.league.leagueId ?? 0,
                selected,
                currentLeague?.mflfranchiseid ?? 0,
                round1((selected.salary ?? 0) * (selected.length ?? 0) * DEAD_CAP_RATE),
              ) as any,
            )
          }
        />
      )}

      <Box sx={{ mb: "14px" }}>
        <TLabel>AMNESTY BUYOUTS · 1 USE / SEASON</TLabel>
        <Box sx={{ fontSize: mobile ? 20 : dfs(24), fontWeight: 800, color: A.text, letterSpacing: "-0.02em" }}>
          Eat the contract
        </Box>
        <Box sx={{ fontSize: dfs(12), color: A.textDim, mt: "4px" }}>
          Cut a player at reduced dead cap: 20% of remaining contract value hits next season only (vs. the normal 40% over multiple years). $15 to the league pot. One per season.
        </Box>
      </Box>

      {candidates === undefined ? (
        <TPanel sx={{ textAlign: "center", py: 4 }}>
          <Box sx={{ color: A.textDim, fontSize: 13 }}>Unable to load buyout eligibility.</Box>
        </TPanel>
      ) : candidates.length === 0 ? (
        <>
          <Box
            sx={{
              background: A.panel,
              border: `1px solid ${A.amber}`,
              padding: mobile ? "12px" : "14px",
              mb: "14px",
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
              <Box>
                <TLabel>CURRENT SEASON</TLabel>
                <Box sx={{ fontSize: dfs(18), fontWeight: 700, color: A.amber, fontFamily: A.mono, mt: "2px" }}>
                  BUYOUT USED · NO BUYOUTS LEFT
                </Box>
              </Box>
              <Box sx={{ fontFamily: A.mono, fontSize: dfs(10), color: A.textDim, textAlign: mobile ? "left" : "right" }}>
                next available: <Box component="span" sx={{ color: A.lime }}>NEXT OFFSEASON</Box>
              </Box>
            </Box>
          </Box>
        </>
      ) : (
        <>
          <Box
            sx={{
              background: A.panel,
              border: `1px solid ${A.lime}`,
              padding: mobile ? "12px" : "14px",
              mb: "14px",
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
              <Box>
                <TLabel>CURRENT SEASON</TLabel>
                <Box sx={{ fontSize: dfs(18), fontWeight: 700, color: A.lime, fontFamily: A.mono, mt: "2px" }}>
                  1 BUYOUT AVAILABLE
                </Box>
              </Box>
              <Box sx={{ fontFamily: A.mono, fontSize: dfs(10), color: A.textDim, textAlign: mobile ? "left" : "right" }}>
                {candidates.length} ELIGIBLE PLAYER{candidates.length === 1 ? "" : "S"}
              </Box>
            </Box>
          </Box>

          <Box>
            <TLabel sx={{ display: "block", mb: "8px" }}>
              BUYOUT MODELING · {candidates.length} EVALUATED
            </TLabel>
            {candidates.map((p, i) => (
              <CandidateCard
                key={p.mflId}
                player={p}
                selected={selectedIdx === i}
                mobile={mobile}
                onSelect={() => setSelectedIdx(selectedIdx === i ? undefined : i)}
              />
            ))}
          </Box>

          {selected && (
            <Box sx={{ mb: "20px" }}>
              <TActionButton
                variant="red"
                fullWidth
                onClick={() => dispatch(updateUI({ modal: "buyout-confirm" }))}
              >
                BUYOUT {selected.fullName} · 20% DEAD CAP NEXT YR
              </TActionButton>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
