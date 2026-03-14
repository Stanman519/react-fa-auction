import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { Button, Card, Chip, Typography } from "@mui/material";
import { useState } from "react";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { TogglePlayerCardButton } from "./TogglePlayerCardButton";
import { ConfirmModal } from "../ConfirmModal";
import { updateUI } from "../../redux/actions/UiActions";
import { submitHoldout } from "../../redux/actions/TransactionActions";

/** Map scoreTier (1-based position rank tier) to a readable label */
const tierLabel = (position: string, tier: number): string => {
  const pos = position?.toUpperCase() ?? "";
  const posMap: Record<string, string[]> = {
    QB: ["QB1", "QB2", "QB3"],
    RB: ["RB1", "RB2", "RB3", "RB4"],
    WR: ["WR1", "WR2", "WR3", "WR4", "WR5"],
    TE: ["TE1", "TE2", "TE3"],
  };
  const tiers = posMap[pos] ?? [];
  return tiers[tier - 1] ?? `${pos} Tier ${tier}`;
};

const Holdouts = () => {
  const dispatch = useDispatch();
  const confirmModal = useSelector(
    (state: RootState) => state.ui.modal === "holdout-confirm",
  );
  const { currentLeagueId } = useSelector((state: RootState) => state.profile);
  const { owner } = useSelector((state: RootState) => state.profile);
  const currentLeague = useSelector((state: RootState) =>
    state.profile.owner.leagues.find(
      (l) => l.league.leagueId === currentLeagueId,
    ),
  );
  const [selectedPlayerIndex, setSelectedPlayerIndex] = useState<
    number | undefined
  >(undefined);

  const franchiseId = currentLeague?.mflfranchiseid;
  const holdouts = currentLeague?.holdoutCandidates ?? [];
  const selected = selectedPlayerIndex !== undefined ? holdouts[selectedPlayerIndex] : undefined;

  if (holdouts.length === 0) {
    return (
      <div className="m-4 flex justify-center">
        <Card className="max-w-3xl flex-1 p-6">
          <div className="flex flex-col items-center gap-3 text-center py-4">
            <TrendingUpIcon sx={{ fontSize: 48, opacity: 0.3 }} />
            <Typography variant="h6" color="text.secondary">
              No holdouts this offseason
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Eligible players are drawn after the Super Bowl. Check back once
              the offseason begins.
            </Typography>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="m-4 flex justify-center">
      {confirmModal && selected && (
        <ConfirmModal
          isOpen={confirmModal}
          actionButtonLabel="Pay the raise"
          mainText={`Give ${selected.player.fullName} a raise from $${selected.originalSalary} to $${selected.holdoutSalary} for the life of his contract?`}
          onAction={() =>
            dispatch(
              submitHoldout(
                currentLeague?.league.leagueId!,
                owner.leagues.find((l) => l.league.leagueId === currentLeagueId)
                  ?.mflfranchiseid!,
                selected.player.mflId,
                selected.id,
              ),
            )
          }
        />
      )}

      <Card className="max-w-3xl flex-1">
        <div className="px-4 pt-4 pb-2">
          <Typography variant="body2" color="text.secondary">
            These players outperformed their pay tier and are demanding a raise.
            Accepting locks in their new salary for the life of the contract. If
            you do nothing, they hold out through Week 8.
          </Typography>
        </div>

        {holdouts.map((p, index) => {
          const raise = p.holdoutSalary - p.originalSalary;
          const label = tierLabel(p.player.position, p.scoreTier);
          return (
            <div key={p.player.mflId}>
              <TogglePlayerCardButton
                player={p.player}
                attribute1={`$${p.originalSalary} · ${p.yearsRemaining} yr${p.yearsRemaining !== 1 ? "s" : ""} left`}
                attribute2={`Wants: $${p.holdoutSalary} (+$${raise})`}
                onSelect={() =>
                  selectedPlayerIndex === index
                    ? setSelectedPlayerIndex(undefined)
                    : setSelectedPlayerIndex(index)
                }
                isSelected={index === selectedPlayerIndex}
              />
              {/* Context chip — only shown when data is available */}
              {p.scoreTier > 0 && (
                <div className="px-4 pb-2 flex gap-2 flex-wrap">
                  <Chip
                    icon={<TrendingUpIcon />}
                    label={`${label} · below $${p.salaryComparison} threshold`}
                    size="small"
                    color="warning"
                    variant="outlined"
                  />
                </div>
              )}
            </div>
          );
        })}

        {selectedPlayerIndex !== undefined &&
          currentLeague?.league.leagueId &&
          franchiseId && (
            <div className="flex flex-row justify-center m-3">
              <Button
                className="w-full"
                variant="contained"
                color="success"
                startIcon={<AttachMoneyIcon />}
                onClick={() => dispatch(updateUI({ modal: "holdout-confirm" }))}
                sx={{ py: 1.5, fontSize: { xs: "0.85rem", sm: "1rem" } }}
              >
                Pay {selected?.player.fullName}'s raise (${selected?.holdoutSalary}/yr)
              </Button>
            </div>
          )}
      </Card>
    </div>
  );
};

export default Holdouts;
