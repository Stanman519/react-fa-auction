import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { Box } from "@mui/material";
import { RootState } from "../../store";
import { ConfirmModal } from "../ConfirmModal";
import { updateUI } from "../../redux/actions/UiActions";
import { submitFranchiseTag } from "../../redux/actions/TransactionActions";
import {
  A,
  dfs,
  TPanel,
  TLabel,
  TPosBadge,
  TActionButton,
  useIsMobile,
} from "./terminal";

export default function FranchiseTagsTerminal() {
  const dispatch = useDispatch();
  const mobile = useIsMobile();
  const confirmModal = useSelector((s: RootState) => s.ui.modal === "tag-confirm");
  const { currentLeagueId } = useSelector((s: RootState) => s.profile);
  const currentLeague = useSelector((s: RootState) =>
    s.profile.owner.leagues.find((l) => l.league.leagueId === currentLeagueId),
  );
  const [selectedIdx, setSelectedIdx] = useState<number | undefined>(undefined);

  const franchiseId = currentLeague?.mflfranchiseid;
  const candidates = currentLeague?.tagCandidates ?? [];
  const selected = selectedIdx !== undefined ? candidates[selectedIdx] : undefined;

  // Group candidates by position for the matrix summary (uses real tagAmount data)
  const positionMatrix = Array.from(
    candidates.reduce((map, c) => {
      const pos = c.player.position?.toUpperCase() ?? "—";
      const cur = map.get(pos) ?? { count: 0, min: Infinity };
      cur.count += 1;
      cur.min = Math.min(cur.min, c.tagAmount);
      map.set(pos, cur);
      return map;
    }, new Map<string, { count: number; min: number }>()),
  );

  // Position floor price — used to flag players whose tag exceeds the position minimum
  const posMinByPos = new Map(positionMatrix.map(([pos, info]) => [pos, info.min]));

  return (
    <Box sx={{ background: A.bg, padding: mobile ? "12px" : "18px", color: A.text, minHeight: "100%" }}>
      {confirmModal && selected && (
        <ConfirmModal
          isOpen={confirmModal}
          actionButtonLabel="submit"
          mainText={`Are you sure you want to tag ${selected.player.fullName}? You can only do this once a season and it cannot be reversed.`}
          onAction={() =>
            dispatch(
              submitFranchiseTag(
                currentLeague?.league.leagueId!,
                selected.player.mflId,
                franchiseId!,
                selected.tagAmount,
              ) as any,
            )
          }
        />
      )}

      <Box sx={{ mb: "14px" }}>
        <TLabel>FRANCHISE TAG · 1 USE / OFFSEASON</TLabel>
        <Box sx={{ fontSize: mobile ? 20 : dfs(24), fontWeight: 800, color: A.text, letterSpacing: "-0.02em" }}>
          Lock down your guy
        </Box>
        <Box sx={{ fontSize: dfs(12), color: A.textDim, mt: "4px" }}>
          Tag price = max(20% raise, top-6 avg salary at position). 1 tag/season, max 2 consecutive, 3 career.
        </Box>
      </Box>

      {positionMatrix.length > 0 && (
        <TPanel sx={{ mb: "14px" }}>
          <TLabel>TAG SALARY MATRIX · ELIGIBLE BY POS</TLabel>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: mobile ? "1fr 1fr" : `repeat(${Math.min(positionMatrix.length, 4)}, 1fr)`,
              gap: "10px",
              mt: "10px",
            }}
          >
            {positionMatrix.map(([pos, info]) => (
              <Box
                key={pos}
                sx={{ background: A.panel2, border: `1px solid ${A.line}`, padding: "10px" }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <TPosBadge pos={pos} />
                  <Box sx={{ fontFamily: A.mono, fontSize: dfs(9), color: A.textMute }}>
                    {info.count} ELIGIBLE
                  </Box>
                </Box>
                <Box sx={{ fontFamily: A.mono, fontSize: dfs(9), color: A.textMute, letterSpacing: "0.08em", mt: "8px" }}>
                  MIN TAG PRICE
                </Box>
                <Box sx={{ fontFamily: A.mono, fontSize: dfs(18), fontWeight: 800, color: A.lime, mt: "2px", lineHeight: 1 }}>
                  ${info.min}
                  <Box component="span" sx={{ fontSize: dfs(11), color: A.textDim }}>M</Box>
                </Box>
              </Box>
            ))}
          </Box>
        </TPanel>
      )}

      <Box sx={{ mb: "14px" }}>
        <TLabel sx={{ display: "block", mb: "8px" }}>
          YOUR TAG-ELIGIBLE PLAYERS · {candidates.length}
        </TLabel>
        {candidates.length === 0 ? (
          <TPanel sx={{ textAlign: "center", py: 4 }}>
            <Box sx={{ color: A.textDim, fontSize: dfs(13) }}>
              No tag-eligible players. Only players whose contracts just expired qualify.
            </Box>
          </TPanel>
        ) : (
          <Box sx={{ background: A.panel, border: `1px solid ${A.line}` }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: mobile ? "1fr 90px" : "auto 2fr 1fr 1fr 100px",
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
              {!mobile && <Box sx={{ textAlign: "right" }}>LAST SALARY</Box>}
              {!mobile && <Box sx={{ textAlign: "right" }}>TAG PRICE</Box>}
              <Box sx={{ textAlign: "right" }}>ACTION</Box>
            </Box>
            {candidates.map((c, i) => {
              const isSelected = selectedIdx === i;
              const pos = c.player.position?.toUpperCase() ?? "—";
              const posFloor = posMinByPos.get(pos) ?? c.tagAmount;
              const aboveFloor = c.tagAmount > posFloor;
              return (
                <Box
                  key={c.player.mflId}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: mobile ? "1fr 90px" : "auto 2fr 1fr 1fr 100px",
              columnGap: "12px",
                    padding: "12px 14px",
                    borderBottom: i === candidates.length - 1 ? "none" : `1px solid ${A.line}`,
                    fontFamily: A.mono,
                    fontSize: dfs(12),
                    alignItems: "center",
                    background: isSelected ? A.panel2 : "transparent",
                  }}
                >
                  {!mobile && <TPosBadge pos={c.player.position ?? "POS"} />}
                  <Box>
                    <Box sx={{ color: A.text, fontWeight: 600, fontSize: dfs(13) }}>
                      {c.player.fullName}
                    </Box>
                    <Box sx={{ color: A.textDim, fontSize: dfs(10) }}>
                      {mobile && `${c.player.position ?? ""} · `}
                      {c.player.team}
                      {mobile && (
                        <Box component="span" sx={{ color: aboveFloor ? A.amber : "inherit" }}>
                          {` · $${c.tagAmount}M`}{aboveFloor && " ↑"}
                        </Box>
                      )}
                    </Box>
                  </Box>
                  {!mobile && (
                    <Box sx={{ textAlign: "right", color: A.textDim }}>
                      ${c.lastSeasonSalary}M
                    </Box>
                  )}
                  {!mobile && (
                    <Box sx={{ textAlign: "right", color: aboveFloor ? A.amber : A.lime, fontWeight: 700 }}>
                      ${c.tagAmount}M
                      {aboveFloor && (
                        <Box component="span" sx={{ fontSize: dfs(9), color: A.amber, ml: "4px" }}>↑</Box>
                      )}
                    </Box>
                  )}
                  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <TActionButton
                      variant={isSelected ? "lime" : "ghost"}
                      dense
                      onClick={() => setSelectedIdx(isSelected ? undefined : i)}
                      sx={isSelected ? {} : { color: A.lime, borderColor: A.lime }}
                    >
                      {isSelected ? "✓ SELECTED" : "TAG"}
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
            onClick={() => dispatch(updateUI({ modal: "tag-confirm" }))}
          >
            FRANCHISE TAG {selected.player.fullName} · ${selected.tagAmount}M
          </TActionButton>
        </Box>
      )}
    </Box>
  );
}
