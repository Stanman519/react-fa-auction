import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { Box } from "@mui/material";
import { RootState } from "../../store";
import { ConfirmModal } from "../ConfirmModal";
import { updateUI } from "../../redux/actions/UiActions";
import { submitHoldout } from "../../redux/actions/TransactionActions";
import { HoldoutDTO } from "../../redux/reducers/FreeAgentReducer";
import {
  A,
  dfs,
  TPanel,
  TLabel,
  TPosBadge,
  TActionButton,
  TMathCell,
  useIsMobile,
} from "./terminal";

const tierLabel = (position: string, tier: number): string => {
  const pos = position?.toUpperCase() ?? "";
  const map: Record<string, string[]> = {
    QB: ["QB1", "QB2", "QB3"],
    RB: ["RB1", "RB2", "RB3", "RB4"],
    WR: ["WR1", "WR2", "WR3", "WR4", "WR5"],
    TE: ["TE1", "TE2", "TE3"],
  };
  return map[pos]?.[tier - 1] ?? `${pos} T${tier}`;
};

function HoldoutCard({
  h,
  capRoom,
  mobile,
  onSelect,
  isSelected,
}: {
  h: HoldoutDTO;
  capRoom: number;
  mobile: boolean;
  onSelect: () => void;
  isSelected: boolean;
}) {
  const raise = h.holdoutSalary - h.originalSalary;
  const pct = h.originalSalary > 0 ? (raise / h.originalSalary) * 100 : 0;
  const newCap = capRoom - raise * h.yearsRemaining;

  return (
    <Box
      sx={{
        background: A.panel,
        border: `1px solid ${isSelected ? A.amber : A.line}`,
        mb: "14px",
        transition: "border-color 120ms",
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
          <TPosBadge pos={h.player.position ?? "POS"} />
          <Box sx={{ fontSize: mobile ? 16 : dfs(18), fontWeight: 700, color: A.text }}>
            {h.player.fullName}
          </Box>
          {h.player.team && (
            <Box sx={{ color: A.textDim, fontFamily: A.mono, fontSize: dfs(11) }}>
              · {h.player.team}
            </Box>
          )}
        </Box>
        <Box sx={{ fontFamily: A.mono, fontSize: dfs(10), color: h.status === "Accepted" ? A.lime : A.amber }}>
          {h.status.toUpperCase()}
        </Box>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: mobile ? "1fr" : "1.4fr 100px 1.4fr",
          gap: "12px",
          padding: mobile ? "12px" : "16px",
          alignItems: "center",
        }}
      >
        <Box>
          <TLabel>CURRENT CONTRACT</TLabel>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: "8px", mt: "4px" }}>
            <Box sx={{ fontSize: dfs(28), fontWeight: 800, color: A.text, fontFamily: A.mono, lineHeight: 1 }}>
              ${h.originalSalary}
              <Box component="span" sx={{ fontSize: dfs(14), color: A.textDim }}>M</Box>
            </Box>
            <Box sx={{ fontSize: dfs(11), color: A.textDim, fontFamily: A.mono }}>
              × {h.yearsRemaining}YR
            </Box>
          </Box>
        </Box>
        <Box sx={{ textAlign: "center", color: A.amber, fontFamily: A.mono, fontSize: dfs(18), fontWeight: 700 }}>
          {mobile ? "↓" : "→"} +{pct.toFixed(1)}%
        </Box>
        <Box>
          <TLabel>DEMANDING</TLabel>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: "8px", mt: "4px" }}>
            <Box sx={{ fontSize: dfs(28), fontWeight: 800, color: A.amber, fontFamily: A.mono, lineHeight: 1 }}>
              ${h.holdoutSalary}
              <Box component="span" sx={{ fontSize: dfs(14), color: A.textDim }}>M</Box>
            </Box>
            <Box sx={{ fontSize: dfs(11), color: A.textDim, fontFamily: A.mono }}>
              × {h.yearsRemaining}YR
            </Box>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          padding: mobile ? "0 12px 12px" : "0 16px 12px",
          display: "grid",
          gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(4, 1fr)",
          gap: "8px",
        }}
      >
        <TMathCell
          label="TIER"
          value={h.scoreTier > 0 ? tierLabel(h.player.position ?? "", h.scoreTier) : "—"}
        />
        <TMathCell
          label="THRESHOLD"
          value={h.salaryComparison ? `$${h.salaryComparison}M` : "—"}
        />
        <TMathCell label="YEARS LEFT" value={`${h.yearsRemaining}YR`} />
        <TMathCell
          label="RAISE TOTAL"
          value={`+$${(raise * h.yearsRemaining).toFixed(0)}M`}
          tone="amber"
        />
      </Box>

      {h.status === "Pending" && (
        <Box
          sx={{
            borderTop: `1px solid ${A.line}`,
            padding: mobile ? "10px 12px" : "12px 16px",
            background: A.panel2,
          }}
        >
          <TLabel tone="amber">YOUR MOVE</TLabel>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: mobile ? "1fr" : "1fr 1fr",
              gap: "8px",
              mt: "8px",
              mb: "10px",
            }}
          >
            <Box sx={{ background: A.bg, padding: "10px", border: `1px solid ${A.line}` }}>
              <TLabel>PAY THE MAN</TLabel>
              <Box sx={{ color: newCap < 0 ? A.red : A.amber, fontSize: dfs(16), fontWeight: 700, mt: "2px", fontFamily: A.mono }}>
                cap → ${newCap.toFixed(0)}M
              </Box>
              <Box sx={{ color: A.textDim, fontSize: dfs(10), mt: "2px", fontFamily: A.mono }}>
                +${(raise * h.yearsRemaining).toFixed(1)}M total cap hit
              </Box>
            </Box>
            <Box sx={{ background: A.bg, padding: "10px", border: `1px solid ${A.line}` }}>
              <TLabel>HOLD FIRM</TLabel>
              <Box sx={{ color: A.red, fontSize: dfs(16), fontWeight: 700, mt: "2px", fontFamily: A.mono }}>
                holds out
              </Box>
              <Box sx={{ color: A.textDim, fontSize: dfs(10), mt: "2px", fontFamily: A.mono }}>
                player sits through Week 8
              </Box>
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <TActionButton variant="amber" onClick={onSelect} fullWidth={mobile}>
              {isSelected ? "✓ READY TO PAY" : `PAY $${h.holdoutSalary}M`}
            </TActionButton>
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default function HoldoutsTerminal() {
  const dispatch = useDispatch();
  const mobile = useIsMobile();
  const confirmModal = useSelector((s: RootState) => s.ui.modal === "holdout-confirm");
  const { currentLeagueId, owner } = useSelector((s: RootState) => s.profile);
  const currentLeague = useSelector((s: RootState) =>
    s.profile.owner.leagues.find((l) => l.league.leagueId === currentLeagueId),
  );
  const { deadCap } = useSelector((s: RootState) => s.deadCap);
  const [selectedIdx, setSelectedIdx] = useState<number | undefined>(undefined);

  const holdouts = currentLeague?.holdoutCandidates ?? [];
  const pending = holdouts.filter((h) => h.status === "Pending");
  const accepted = holdouts.filter((h) => h.status === "Accepted");
  const selected = selectedIdx !== undefined ? pending[selectedIdx] : undefined;
  const capRoom = deadCap.find((d) => d.franchiseId === currentLeague?.mflfranchiseid)?.capRoom ?? 0;

  if (holdouts.length === 0) {
    return (
      <Box sx={{ background: A.bg, padding: mobile ? "12px" : "18px", color: A.text, minHeight: "100%" }}>
        <TPanel sx={{ textAlign: "center", py: 6 }}>
          <TLabel>NO HOLDOUTS</TLabel>
          <Box sx={{ mt: "8px", color: A.textDim, fontSize: dfs(13) }}>
            Eligible players are drawn after the Super Bowl. Check back when the offseason begins.
          </Box>
        </TPanel>
      </Box>
    );
  }

  return (
    <Box sx={{ background: A.bg, padding: mobile ? "12px" : "18px", color: A.text, minHeight: "100%" }}>
      {confirmModal && selected && (
        <ConfirmModal
          isOpen={confirmModal}
          actionButtonLabel="Pay the raise"
          mainText={`Give ${selected.player.fullName} a raise from $${selected.originalSalary} to $${selected.holdoutSalary} for the life of his contract?`}
          onAction={() =>
            dispatch(
              submitHoldout(
                currentLeague?.league.leagueId!,
                owner.leagues.find((l) => l.league.leagueId === currentLeagueId)?.mflfranchiseid!,
                selected.player.mflId,
                selected.id,
              ) as any,
            )
          }
        />
      )}

      <Box sx={{ mb: "14px" }}>
        <TLabel>ACTIVE HOLDOUTS</TLabel>
        <Box sx={{ fontSize: mobile ? 20 : dfs(24), fontWeight: 800, color: A.text, letterSpacing: "-0.02em" }}>
          The negotiating table
        </Box>
        <Box sx={{ fontSize: dfs(12), color: A.textDim, mt: "4px" }}>
          Players who outperformed their pay tier are demanding a raise. Accepting locks in the new salary for the life of the contract. Otherwise they sit through Week 8.
        </Box>
      </Box>

      {pending.length > 0 && (
        <>
          <TLabel sx={{ display: "block", mb: "8px" }}>
            PENDING · {pending.length}
          </TLabel>
          {pending.map((h, idx) => (
            <HoldoutCard
              key={h.id}
              h={h}
              capRoom={capRoom}
              mobile={mobile}
              isSelected={selectedIdx === idx}
              onSelect={() => {
                if (selectedIdx === idx) {
                  dispatch(updateUI({ modal: "holdout-confirm" }));
                } else {
                  setSelectedIdx(idx);
                }
              }}
            />
          ))}
          {selectedIdx !== undefined && (
            <Box sx={{ mb: "20px" }}>
              <TActionButton
                variant="lime"
                fullWidth
                onClick={() => dispatch(updateUI({ modal: "holdout-confirm" }))}
              >
                CONFIRM PAY {selected?.player.fullName} · ${selected?.holdoutSalary}M/YR
              </TActionButton>
            </Box>
          )}
        </>
      )}

      {accepted.length > 0 && (
        <>
          <TLabel sx={{ display: "block", mb: "8px", mt: "20px" }}>
            ACCEPTED · {accepted.length}
          </TLabel>
          {accepted.map((h) => (
            <HoldoutCard
              key={h.id}
              h={h}
              capRoom={capRoom}
              mobile={mobile}
              isSelected={false}
              onSelect={() => undefined}
            />
          ))}
        </>
      )}
    </Box>
  );
}
