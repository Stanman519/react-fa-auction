import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { Box } from "@mui/material";
import { RootState } from "../../store";
import { ConfirmModal } from "../ConfirmModal";
import { updateUI } from "../../redux/actions/UiActions";
import { submitWaiverExtension } from "../../redux/actions/TransactionActions";
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

const EXT_SALARY = 25;
const EXT_YEARS = 1;

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
  return (
    <Box
      sx={{
        background: A.panel,
        border: `1px solid ${selected ? A.lime : A.line}`,
        mb: "12px",
      }}
    >
      <Box
        sx={{
          padding: mobile ? "10px 12px" : "12px 16px",
          borderBottom: `1px solid ${A.line}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <TPosBadge pos={player.position ?? "POS"} />
          <Box sx={{ fontSize: mobile ? 15 : dfs(16), fontWeight: 700, color: A.text }}>
            {player.fullName}
          </Box>
          {player.team && (
            <Box sx={{ color: A.textDim, fontFamily: A.mono, fontSize: dfs(11) }}>
              · {player.team}
            </Box>
          )}
        </Box>
      </Box>

      <Box sx={{ padding: mobile ? "12px" : "16px" }}>
        <Box
          sx={{
            background: A.panel2,
            border: `1px solid ${A.line}`,
            padding: "12px 10px",
            borderRadius: "2px",
          }}
        >
          <TLabel>1-YEAR EXTENSION · FIXED PRICE</TLabel>
          <Box
            sx={{
              fontFamily: A.mono,
              fontSize: dfs(22),
              fontWeight: 800,
              color: A.text,
              mt: "4px",
              lineHeight: 1,
            }}
          >
            ${EXT_SALARY}
            <Box component="span" sx={{ fontSize: dfs(11), color: A.textDim }}>M × {EXT_YEARS}YR</Box>
          </Box>
          <Box sx={{ fontFamily: A.mono, fontSize: dfs(10), color: A.textDim, mt: "4px" }}>
            ${EXT_SALARY * EXT_YEARS}M total · non-QB only
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          borderTop: `1px solid ${A.line}`,
          padding: mobile ? "10px 12px" : "12px 16px",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <TActionButton variant={selected ? "lime" : "ghost"} onClick={onSelect}
          sx={selected ? {} : { color: A.lime, borderColor: A.lime }}
        >
          {selected ? "✓ SELECTED" : "EXTEND →"}
        </TActionButton>
      </Box>
    </Box>
  );
}

export default function WaiverExtensionsTerminal() {
  const dispatch = useDispatch();
  const mobile = useIsMobile();
  const confirmModal = useSelector((s: RootState) => s.ui.modal === "waiver-confirm");
  const { currentLeagueId } = useSelector((s: RootState) => s.profile);
  const currentLeague = useSelector((s: RootState) =>
    s.profile.owner.leagues.find((l) => l.league.leagueId === currentLeagueId),
  );
  const [selectedIdx, setSelectedIdx] = useState<number | undefined>(undefined);

  const franchiseId = currentLeague?.mflfranchiseid;
  const candidates = currentLeague?.waiverExtensionPlayers ?? [];
  const selected = selectedIdx !== undefined ? candidates[selectedIdx] : undefined;

  return (
    <Box sx={{ background: A.bg, padding: mobile ? "12px" : "18px", color: A.text, minHeight: "100%" }}>
      {confirmModal && selected && (
        <ConfirmModal
          isOpen={confirmModal}
          actionButtonLabel="submit"
          mainText={`Extend ${selected.fullName} for 1 year at $${EXT_SALARY}? You only get one waiver extension per offseason and it cannot be reversed.`}
          onAction={() =>
            dispatch(
              submitWaiverExtension(
                currentLeague?.league.leagueId!,
                selected.mflId,
                franchiseId!,
                EXT_SALARY,
              ) as any,
            )
          }
        />
      )}

      <Box sx={{ mb: "14px" }}>
        <TLabel>WAIVER EXTENSIONS · 1 USE / OFFSEASON</TLabel>
        <Box sx={{ fontSize: mobile ? 20 : dfs(24), fontWeight: 800, color: A.text, letterSpacing: "-0.02em" }}>
          Convert your sleepers
        </Box>
        <Box sx={{ fontSize: dfs(12), color: A.textDim, mt: "4px" }}>
          Lock one in-season waiver pickup into a fixed 1-year, ${EXT_SALARY} contract. Non-QBs only. One use per offseason — cannot be reversed.
        </Box>
      </Box>

      <TPanel sx={{ mb: "14px" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: "8px" }}>
          <TLabel>EXTENSION WINDOW</TLabel>
          <Box sx={{ color: A.lime, fontFamily: A.mono, fontSize: dfs(10), fontWeight: 700, letterSpacing: "0.08em" }}>
            1 LEFT
          </Box>
        </Box>
        <Box
          sx={{
            height: 24,
            background: A.lime,
            border: `1px solid ${A.lime}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: A.mono,
            fontSize: 10,
            fontWeight: 700,
            color: "#000",
            letterSpacing: "0.08em",
          }}
        >
          OPEN
        </Box>
      </TPanel>

      <Box>
        <TLabel sx={{ display: "block", mb: "8px" }}>
          YOUR WAIVER PICKUPS · {candidates.length} ELIGIBLE
        </TLabel>
        {candidates.length === 0 ? (
          <TPanel sx={{ textAlign: "center", py: 4 }}>
            <Box sx={{ color: A.textDim, fontSize: dfs(13) }}>
              No eligible waiver pickups from last season.
            </Box>
          </TPanel>
        ) : (
          candidates.map((p, i) => (
            <CandidateCard
              key={p.mflId}
              player={p}
              selected={selectedIdx === i}
              mobile={mobile}
              onSelect={() => setSelectedIdx(selectedIdx === i ? undefined : i)}
            />
          ))
        )}
      </Box>

      {selected && (
        <Box sx={{ mb: "20px" }}>
          <TActionButton
            variant="lime"
            fullWidth
            onClick={() => dispatch(updateUI({ modal: "waiver-confirm" }))}
          >
            EXTEND {selected.fullName} · ${EXT_SALARY}M × {EXT_YEARS}YR
          </TActionButton>
        </Box>
      )}
    </Box>
  );
}
