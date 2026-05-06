import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { Box } from "@mui/material";
import { RootState } from "../../store";
import { ConfirmModal } from "../ConfirmModal";
import { updateUI } from "../../redux/actions/UiActions";
import { submitFifthYearOption } from "../../redux/actions/TransactionActions";
import {
  A,
  dfs,
  TPanel,
  TLabel,
  TPosBadge,
  TActionButton,
  useIsMobile,
} from "./terminal";

export default function FifthYearOptionTerminal() {
  const dispatch = useDispatch();
  const mobile = useIsMobile();
  const confirmModal = useSelector(
    (s: RootState) => s.ui.modal === "fifth-year-confirm",
  );
  const { currentLeagueId } = useSelector((s: RootState) => s.profile);
  const currentLeague = useSelector((s: RootState) =>
    s.profile.owner.leagues.find((l) => l.league.leagueId === currentLeagueId),
  );
  const [selectedIdx, setSelectedIdx] = useState<number | undefined>(undefined);

  const franchiseId = currentLeague?.mflfranchiseid;
  const candidates = currentLeague?.fifthYearOptionCandidates ?? [];
  const selected =
    selectedIdx !== undefined ? candidates[selectedIdx] : undefined;

  return (
    <Box
      sx={{
        background: A.bg,
        padding: mobile ? "12px" : "18px",
        color: A.text,
        minHeight: "100%",
      }}
    >
      {confirmModal && selected && (
        <ConfirmModal
          isOpen={confirmModal}
          actionButtonLabel="submit"
          mainText={`Sign ${selected.player.fullName} to a 5th year option for $${selected.optionSalary} (1 year)? This adds them to your roster and is irreversible.`}
          onAction={() =>
            dispatch(
              submitFifthYearOption(
                currentLeague?.league.leagueId!,
                selected.player.mflId,
                franchiseId!,
              ) as any,
            )
          }
        />
      )}

      <Box sx={{ mb: "14px" }}>
        <TLabel>5TH YEAR OPTION · 1 YR DEAL</TLabel>
        <Box
          sx={{
            fontSize: mobile ? 20 : dfs(24),
            fontWeight: 800,
            color: A.text,
            letterSpacing: "-0.02em",
          }}
        >
          Pick up a rookie's 5th year
        </Box>
        <Box sx={{ fontSize: dfs(12), color: A.textDim, mt: "4px" }}>
          1st-round picks from {new Date().getFullYear() - 4} whose rookie
          contract just expired. Option = +30% of original rookie salary, 1 yr.
        </Box>
      </Box>

      <Box sx={{ mb: "14px" }}>
        <TLabel sx={{ display: "block", mb: "8px" }}>
          YOUR ELIGIBLE PLAYERS · {candidates.length}
        </TLabel>
        {candidates.length === 0 ? (
          <TPanel sx={{ textAlign: "center", py: 4 }}>
            <Box sx={{ color: A.textDim, fontSize: dfs(13) }}>
              No 5th-year-option-eligible players. Only your 1st-round picks
              from 4 yrs ago whose rookie deal just expired qualify.
            </Box>
          </TPanel>
        ) : (
          <Box sx={{ background: A.panel, border: `1px solid ${A.line}` }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: mobile
                  ? "1fr 90px"
                  : "auto 2fr 1fr 1fr 100px",
                columnGap: "12px",
                padding: "8px 14px",
                borderBottom: `1px solid ${A.lineBold}`,
                fontFamily: A.mono,
                fontSize: dfs(9),
                color: A.textMute,
                letterSpacing: "0.08em",
              }}
            >
              {!mobile && <Box>POS</Box>}
              <Box>PLAYER</Box>
              {!mobile && <Box sx={{ textAlign: "right" }}>ROOKIE $</Box>}
              {!mobile && <Box sx={{ textAlign: "right" }}>OPTION $</Box>}
              <Box sx={{ textAlign: "right" }}>ACTION</Box>
            </Box>
            {candidates.map((c, i) => {
              const isSelected = selectedIdx === i;
              return (
                <Box
                  key={c.player.mflId}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: mobile
                      ? "1fr 90px"
                      : "auto 2fr 1fr 1fr 100px",
                    columnGap: "12px",
                    padding: "12px 14px",
                    borderBottom:
                      i === candidates.length - 1
                        ? "none"
                        : `1px solid ${A.line}`,
                    fontFamily: A.mono,
                    fontSize: dfs(12),
                    alignItems: "center",
                    background: isSelected ? A.panel2 : "transparent",
                  }}
                >
                  {!mobile && <TPosBadge pos={c.player.position ?? "POS"} />}
                  <Box>
                    <Box
                      sx={{
                        color: A.text,
                        fontWeight: 600,
                        fontSize: dfs(13),
                      }}
                    >
                      {c.player.fullName}
                    </Box>
                    <Box sx={{ color: A.textDim, fontSize: dfs(10) }}>
                      {mobile && `${c.player.position ?? ""} · `}
                      {c.player.team} · {c.draftYear} R1 P{c.draftPick}
                      {mobile && (
                        <Box component="span" sx={{ color: A.lime }}>
                          {` · $${c.originalRookieSalary} → $${c.optionSalary}`}
                        </Box>
                      )}
                    </Box>
                  </Box>
                  {!mobile && (
                    <Box sx={{ textAlign: "right", color: A.textDim }}>
                      ${c.originalRookieSalary}M
                    </Box>
                  )}
                  {!mobile && (
                    <Box
                      sx={{
                        textAlign: "right",
                        color: A.lime,
                        fontWeight: 700,
                      }}
                    >
                      ${c.optionSalary}M
                    </Box>
                  )}
                  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <TActionButton
                      variant={isSelected ? "lime" : "ghost"}
                      dense
                      onClick={() =>
                        setSelectedIdx(isSelected ? undefined : i)
                      }
                      sx={
                        isSelected
                          ? {}
                          : { color: A.lime, borderColor: A.lime }
                      }
                    >
                      {isSelected ? "✓ SELECTED" : "OPTION"}
                    </TActionButton>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>

      {selectedIdx !== undefined && selected && (
        <Box sx={{ mb: "20px" }}>
          <TActionButton
            variant="lime"
            fullWidth
            onClick={() =>
              dispatch(updateUI({ modal: "fifth-year-confirm" }))
            }
          >
            SIGN {selected.player.fullName} · ${selected.optionSalary}M (1 YR)
          </TActionButton>
        </Box>
      )}
    </Box>
  );
}
