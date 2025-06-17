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
  submitWaiverExtension,
} from "../../redux/actions/TransactionActions";

const WaiverExtensions = () => {
  const dispatch = useDispatch();
  const confirmModal = useSelector(
    (state: RootState) => state.ui.modal === "waiver-confirm",
  );
  const { currentLeagueId } = useSelector((state: RootState) => state.profile);
  const currentLeague = useSelector((state: RootState) =>
    state.profile.owner.leagues.find(
      (l) => l.league.leagueId === currentLeagueId,
    ),
  );
  const [selectedPlayerIndex, setSelectedPlayerIndex] = useState<
    number | undefined
  >(undefined);
  const franchiseId = currentLeague?.mflfranchiseid;
  const waivers = currentLeague?.waiverExtensionPlayers ?? [];

  return (
    <div className="m-4 flex justify-center">
      {confirmModal && (
        <ConfirmModal
          isOpen={confirmModal}
          actionButtonLabel={"submit"}
          mainText={`Are you sure you want to tag ${waivers[selectedPlayerIndex ?? 0]?.fullName}? You can only do this once a season and it cannot be reversed.`}
          onAction={() =>
            dispatch(
              submitWaiverExtension(
                currentLeague?.league.leagueId!,
                waivers[selectedPlayerIndex ?? 0].mflId,
                franchiseId!,
                25,
              ),
            )
          }
        />
      )}
      <Card className="max-w-3xl flex-1">
        <div className="flex flex-col">
          <div className="flex flex-row ml-2 mr-3 flex-1 ">
            <div className="w-3/4" />
            <div className="flex flex-row w-1/4 justify-center">
              <div className="flex-1">1 YEAR EXTENSION SALARY</div>
            </div>
          </div>

          {waivers.map((p, index) => {
            return (
              <TogglePlayerCardButton
                key={p.mflId}
                player={p}
                // attribute1={`$${p.lastSeasonSalary}`}
                attribute2={`$25`}
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
                    dispatch(updateUI({ modal: "waiver-confirm" }))
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
                      GIVE 1 YEAR EXTENSION TO THIS PLAYER
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

export default WaiverExtensions;
