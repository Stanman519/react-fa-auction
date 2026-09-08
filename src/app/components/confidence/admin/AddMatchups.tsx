import React, { useEffect } from "react";
import { Button, Input, TextField, Select, MenuItem, Box } from "@mui/material";
import { NflMatchup, NflTeam } from "../../../models/ConfidenceDTOs";
import GeneralApiSvc from "../../../services/GeneralApiSvc";
import { AddMatchupTeamSelector } from "./AddMatchupTeamSelector";
import { useDispatch } from "react-redux";
import {
  adminAddNewMatchup,
  getMatchups,
  makeMatchupsUnpickable,
  setupAdminScreen,
} from "../../../redux/actions/ConfidenceActions";
import { useAppSelector } from "../../../hooks";
import { useAuth0 } from "@auth0/auth0-react";
import { AdminPanel } from "./AdminPanel";

export interface NewMatchup {
  left: number;
  right: number;
  index: number;
}

export const AddMatchups = (): JSX.Element => {
  const [year, setYear] = React.useState<number>(0);
  const [week, setWeek] = React.useState<number>(0);
  const [teams, setTeams] = React.useState<NflTeam[]>([]);
  const { owner, authSynchronized } = useAppSelector((state) => state.profile);
  const { matchups, nflTeams } = useAppSelector((state) => state.confidence);

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

  const addMatchup = () => {
    const newMatchup: NewMatchup = {
      index: newMatchups.length,
      left: 0,
      right: 0,
    };
    setNewMatchups([...newMatchups, newMatchup]);
  };

  return (
    <AdminPanel title="Add Matchups">
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
          user?.sub &&
          dispatch(adminAddNewMatchup(teams, newMatchups, week, year, user.sub))
        }
        disabled={!user?.sub}
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
        onClick={() =>
          user?.sub && dispatch(makeMatchupsUnpickable(user.sub, year))
        }
        disabled={!user?.sub}
      >
        LOCK ALL MATCHUPS
      </Button>
    </AdminPanel>
  );
};

export const AdminMatchup = ({ m }: { m: NflMatchup }): JSX.Element => {
  return (
    <Box
      className="flex flex-col m-3 w-1/2"
      sx={{ border: 1, borderColor: "divider", borderRadius: 1 }}
    >
      <div>Week:{m.week}</div>
      <div className="flex flex-row justify-between">
        <div>{m.left.name}</div>

        <div>{m.right.name}</div>
      </div>
    </Box>
  );
};
