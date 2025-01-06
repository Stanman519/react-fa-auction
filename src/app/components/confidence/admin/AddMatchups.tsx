import React, { useEffect } from "react";
import { Button, Input, TextField } from "@mui/material";
import { NflMatchup, NflTeam } from "../../../models/ConfidenceDTOs";
import GeneralApiSvc from "../../../services/GeneralApiSvc";
import { AddMatchupTeamSelector } from "./AddMatchupTeamSelector";
import { useDispatch, useSelector } from "react-redux";
import {
  adminAddNewMatchup,
  getMatchups,
  makeMatchupsUnpickable,
  setupAdminScreen,
} from "../../../redux/actions/ConfidenceActions";
import { RootState } from "../../../redux/reducers/RootReducer";
import { useAuth0 } from "@auth0/auth0-react";

export interface NewMatchup {
  left: number;
  right: number;
  index: number;
}

export const AddMatchups = (): JSX.Element => {
  const [year, setYear] = React.useState<number>(0);
  const [week, setWeek] = React.useState<number>(0);
  const [teams, setTeams] = React.useState<NflTeam[]>([]);
  const { owner, authSynchronized } = useSelector(
    (state: RootState) => state.profile,
  );
  const { matchups, nflTeams } = useSelector(
    (state: RootState) => state.confidence,
  );
  const [newMatchups, setNewMatchups] = React.useState<NewMatchup[]>([]);
  const dispatch = useDispatch();
  const { user, isAuthenticated, loginWithRedirect, isLoading } = useAuth0();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.sub && authSynchronized) {
      dispatch(setupAdminScreen());
    }
  }, [isLoading, isAuthenticated, user, authSynchronized]);

  useEffect(() => {
    if (nflTeams && nflTeams?.length > 0) {
      setTeams(nflTeams);
      setNewMatchups([{ index: 0, left: 0, right: 0 }]);
    }
  }, [nflTeams]);

  const draftChanges = (index: number, id: number, side: "left" | "right") => {
    let draft = [...newMatchups];
    const editIndex = draft.findIndex((d) => d.index == index);
    if (editIndex < 0) return;
    side === "left"
      ? (draft[editIndex].left = id)
      : (draft[editIndex].right = id);
    setNewMatchups(draft);
  };

  return (
    <div className="flex flex-col w-1/2 border border-black m-6">
      <div>ADD MATCHUPS</div>
      {teams.length > 0 &&
        newMatchups.map((nm, index) => (
          <AddMatchupTeamSelector
            key={index}
            teams={teams}
            setLeft={(ind, id) => draftChanges(ind, id, "left")}
            setRight={(ind, id) => draftChanges(ind, id, "right")}
            left={nm.left}
            right={nm.right}
            index={index}
          />
        ))}
      <Button
        variant="outlined"
        onClick={() => {
          setNewMatchups([
            ...newMatchups,
            { index: newMatchups.length, left: 0, right: 0 },
          ]);
        }}
      >
        ADD MATCHUP
      </Button>
      <div className="flex flex-row content-between m-1 w-full">
        <TextField
          id="outlined-number"
          label="Set Week"
          type="number"
          InputLabelProps={{
            shrink: true,
          }}
          onChange={(event) => setWeek(Number.parseInt(event.target.value))}
          value={week}
        />
        <TextField
          id="outlined-number"
          label="Set Year"
          type="number"
          InputLabelProps={{
            shrink: true,
          }}
          onChange={(event) => {
            setYear(Number.parseInt(event.target.value));
          }}
          value={year}
        />
      </div>

      <Button
        variant="outlined"
        onClick={() =>
          dispatch(adminAddNewMatchup(teams, newMatchups, week, year))
        }
      >
        SAVE TO DB
      </Button>
      <Button onClick={() => dispatch(getMatchups(user ?? {}, year))}>
        See Matchups from selected year
      </Button>
      <div>{matchups?.map((m) => <AdminMatchup key={m.id} m={m} />)}</div>

      <Button
        color="error"
        sx={{ margin: 4 }}
        onClick={() => dispatch(makeMatchupsUnpickable(year))}
      >
        LOCK ALL MATCHUPS
      </Button>
    </div>
  );
};

export const AdminMatchup = ({ m }: { m: NflMatchup }): JSX.Element => {
  return (
    <div className="border rounded border-black flex flex-col m-3 w-1/2">
      <div>Week:{m.week}</div>
      <div className="flex flex-row justify-between">
        <div>{m.left.name}</div>

        <div>{m.right.name}</div>
      </div>
    </div>
  );
};
