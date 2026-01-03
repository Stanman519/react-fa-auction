import React, { useEffect } from "react";
import { Button, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { NflTeam } from "../../../models/ConfidenceDTOs";
import GeneralApiSvc from "../../../services/GeneralApiSvc";

export const AddMatchupTeamSelector = ({
  teams,
  left,
  right,
  setLeft,
  setRight,
  index,
}: {
  index: number;
  teams: NflTeam[];
  left?: number;
  right?: number;
  setLeft: (index: number, id: number) => void;
  setRight: (index: number, id: number) => void;
}): JSX.Element => {
  const handleLeft = (event: SelectChangeEvent) => {
    setLeft(index, +event.target.value);
  };
  const handleRight = (event: SelectChangeEvent) => {
    setRight(index, +event.target.value);
  };

  return (
    <div className="flex flex-row flex-grow w-full mt-5">
      <Select
        variant="standard"
        sx={{ flex: 1 }}
        value={`${left ?? ""}`}
        size="medium"
        onChange={handleLeft}
        label="select away team"
        displayEmpty
      >
        <MenuItem value="">
          <em>Select Away Team</em>
        </MenuItem>
        {teams
          .map((t) => {
            return {
              tricode: t.tricode,
              id: t.id,
            };
          })
          .map((m) => (
            <MenuItem key={m.id} value={m.id}>
              {m.tricode}
            </MenuItem>
          ))}
      </Select>
      <Select
        variant="standard"
        sx={{ flex: 1 }}
        value={`${right ?? ""}`}
        size="medium"
        onChange={handleRight}
        label="select home team"
        displayEmpty
      >
        <MenuItem value="">
          <em>Select Home Team</em>
        </MenuItem>
        {teams
          .map((t) => {
            return {
              tricode: t.tricode,
              id: t.id,
            };
          })
          .map((m) => (
            <MenuItem key={m.id} value={m.id}>
              {m.tricode}
            </MenuItem>
          ))}
      </Select>
    </div>
  );
};
