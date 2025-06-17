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
} from "../../redux/actions/TransactionActions";

const FranchiseTags = () => {
  const dispatch = useDispatch();
  const confirmModal = useSelector(
    (state: RootState) => state.ui.modal === "tag-confirm",
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
  const tagPlayers = currentLeague?.tagCandidates ?? [];

  return (
    <div className="m-4 flex justify-center">
      {confirmModal && (
        <ConfirmModal
          isOpen={confirmModal}
          actionButtonLabel={"submit"}
          mainText={`Are you sure you want to tag ${tagPlayers[selectedPlayerIndex ?? 0]?.player.fullName}? You can only do this once a season and it cannot be reversed.`}
          onAction={() =>
            dispatch(
              submitFranchiseTag(
                currentLeague?.league.leagueId!,
                tagPlayers[selectedPlayerIndex ?? 0].player.mflId,
                franchiseId!,
                tagPlayers[selectedPlayerIndex ?? 0].tagAmount,
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
              <div className="flex-1">TAG PRICE</div>
            </div>
          </div>

          {tagPlayers.map((p, index) => {
            return (
              <TogglePlayerCardButton
                key={p.player.mflId}
                player={p.player}
                // attribute1={`$${p.lastSeasonSalary}`}
                attribute2={`$${p.tagAmount ?? 0}`}
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
                  onClick={() => dispatch(updateUI({ modal: "tag-confirm" }))}
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
                      FRANCHISE TAG THIS PLAYER
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

export default FranchiseTags;
