import { Draggable } from "@hello-pangea/dnd";
import React, { useEffect, useRef } from "react";
import {
  Box,
  Button,
  Card,
  FormControlLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { ArrowDownward, ArrowUpward } from "@mui/icons-material";
import { NflTeam } from "../../../models/ConfidenceDTOs";
import { useAppSelector } from "../../../hooks";
import GeneralApiSvc from "../../../services/GeneralApiSvc";
import { useAuth0 } from "@auth0/auth0-react";
import { AdminPanel } from "./AdminPanel";

interface stateRadio {
  id?: number;
  value?: string;
}

export const DecideMatchups = (): JSX.Element => {
  const { matchups } = useAppSelector((state) => state.confidence);
  const [value, setValue] = React.useState<stateRadio[]>([]);
  const { user } = useAuth0();
  console.log("matchups", matchups);
  useEffect(() => {
    setValue(
      matchups.map((m) => {
        return { id: m.id, value: m.left.tricode };
      }),
    );
  }, [matchups]);

  const submitWinner = async (matchupId: number) => {
    if (!user?.sub) {
      alert("Please log in to submit results");
      return;
    }
    const winningTricode = value.find((m) => m.id === matchupId)?.value;
    if (!winningTricode) return;
    await GeneralApiSvc.setWinnerForMatchup(
      matchupId,
      winningTricode,
      user.sub,
    );
  };
  const setCurrentMatchup = async (matchupId: number) => {
    if (!user?.sub) {
      alert("Please log in to set current matchup");
      return;
    }
    await GeneralApiSvc.setCurrentMatchup(matchupId, user.sub);
  };
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    matchupId: number,
  ) => {
    var newVals = value.filter((v) => v.id !== matchupId);
    setValue([...newVals, { id: matchupId, value: event.target.value }]);
  };
  return (
    <AdminPanel title="Decide Matchups">
      {matchups
        ?.filter((m) => !m.pickable)
        ?.map((m, i) => (
          <Box
            key={m.id}
            className="m-1"
            sx={{ border: 1, borderColor: "divider", borderRadius: 1 }}
          >
            <RadioGroup
              aria-labelledby="demo-controlled-radio-buttons-group"
              name="controlled-radio-buttons-group"
              value={value.find((v) => v.id === m.id)?.value ?? m.left.tricode}
              onChange={(e) => handleChange(e, m.id)}
            >
              <FormControlLabel
                value={m.left.id}
                control={<Radio />}
                label={m.left.name}
              />
              <FormControlLabel
                value={m.right.id}
                control={<Radio />}
                label={m.right.name}
              />
            </RadioGroup>
            <Button onClick={async () => await submitWinner(m.id)}>
              SUBMIT
            </Button>
            <Button onClick={async () => await setCurrentMatchup(m.id)}>
              SET CURRENT
            </Button>
          </Box>
        ))}
    </AdminPanel>
  );
};
