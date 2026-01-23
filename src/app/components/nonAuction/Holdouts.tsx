import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { useTheme } from "@mui/material/styles";
import { Button, Card } from "@mui/material";
import { lastYear } from "../../services/Common";
import { useEffect, useState } from "react";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import { TogglePlayerCardButton } from "./TogglePlayerCardButton";
import { ConfirmModal } from "../ConfirmModal";
import { updateUI } from "../../redux/actions/UiActions";
import {
  getFranchiseTagCandidates,
  submitFranchiseTag,
  submitHoldout,
  submitWaiverExtension,
} from "../../redux/actions/TransactionActions";

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
  console.log("holdouts", holdouts);
  return (
    <div className="m-4 flex justify-center">
      {confirmModal && (
        <ConfirmModal
          isOpen={confirmModal}
          actionButtonLabel={"submit"}
          mainText={`Are you sure you want to give ${holdouts[selectedPlayerIndex ?? 0]?.player.fullName} this raise for the life of his contract?`}
          onAction={() =>
            dispatch(
              submitHoldout(
                currentLeague?.league.leagueId!,
                owner.leagues.find((l) => l.league.leagueId === currentLeagueId)
                  ?.mflfranchiseid!,
                holdouts[selectedPlayerIndex ?? 0].player.mflId,
                holdouts[selectedPlayerIndex ?? 0].id,
              ),
            )
          }
        />
      )}
      <Card className="max-w-3xl flex-1">
        <div>
          {holdouts.map((p, index) => {
            return (
              <TogglePlayerCardButton
                key={p.player.mflId}
                player={p.player}
                attribute1={`Salary: $${p.originalSalary}`}
                attribute2={`New Demand: $${p.holdoutSalary}`}
                onSelect={() =>
                  selectedPlayerIndex === index
                    ? setSelectedPlayerIndex(undefined)
                    : setSelectedPlayerIndex(index)
                }
                isSelected={index === selectedPlayerIndex}
              />
            );
          })}

          {selectedPlayerIndex !== undefined &&
            currentLeague?.league.leagueId &&
            franchiseId && (
              <div className="flex flex-row justify-center content-center m-3">
                <Button
                  className="w-full"
                  style={{ backgroundColor: "green" }}
                  onClick={() =>
                    dispatch(updateUI({ modal: "holdout-confirm" }))
                  }
                >
                  <div className="flex flex-row justify-center content-center pl-3 pr-4 pt-2 pb-2 ">
                    <AttachMoneyIcon
                      style={{
                        color: "white",
                        marginRight: 10,
                        alignSelf: "center",
                      }}
                    />
                    <div className="lg:text-2xl text-white">
                      GIVE IN TO THIS PLAYER'S DEMANDS?
                    </div>
                  </div>
                </Button>
              </div>
            )}
        </div>
      </Card>
    </div>
  );
};

export default Holdouts;
