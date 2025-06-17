import "../../styles/CapDetails.css";
import "../../styles/DeadCapTable.css";
import { Card, CardContent } from "@mui/material";
import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import FranchiseTags from "./FranchiseTags";
import TaxiSquadTile from "./TaxiSquadTile";
import BuyoutTile from "./BuyoutTile";

export default function TeamManagementCard() {
  const { currentLeagueId } = useSelector((state: RootState) => state.profile);
  const currentLeague = useSelector((state: RootState) =>
    state.profile.owner.leagues.find(
      (l) => l.league.leagueId === currentLeagueId,
    ),
  );
  return !currentLeague ? (
    <div />
  ) : (
    <Card className="card-container" style={{ margin: 16 }}>
      <CardContent style={{ display: "grid" }}>
        {currentLeague?.tagCandidates?.length > 0 && <FranchiseTags />}
        {currentLeague?.taxiPlayers?.length > 0 && <TaxiSquadTile />}
        {currentLeague?.cutCandidates?.length > 0 && <BuyoutTile />}
      </CardContent>
    </Card>
  );
}
