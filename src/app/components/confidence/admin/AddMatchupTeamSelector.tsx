import React, { useEffect } from "react";
import { Button, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { NflTeam } from "../../../models/ConfidenceDTOs";
import GeneralApiSvc from "../../../services/GeneralApiSvc";



export const AddMatchupTeamSelector = ({teams, left, right, setLeft, setRight, index}: 
    {index: number, teams: NflTeam[], left?: string, right?: string, setLeft: (index: number, str: string) => void, setRight: (index: number, str: string) => void}): JSX.Element => {
    
        const handleLeft = (event: SelectChangeEvent) => {
        setLeft(index, event.target.value as string);
      };
      const handleRight = (event: SelectChangeEvent) => {
          setRight(index, event.target.value as string); 
        };

    return (

      <div className="flex flex-row flex-grow w-full mt-5">

            <Select variant="standard" sx={{flex: 1}} value={left} size="medium" onChange={handleLeft} label="select away team">
                {
                    teams.map(t => t.tricode).map(m => 
                        <MenuItem key={m} defaultValue={''} value={m}>{m}</MenuItem>
                        )
                }
            </Select>
            <Select variant="standard" sx={{flex: 1}} value={right} size="medium" onChange={handleRight} label="select home team">
                {
                    teams.map(t => t.tricode).map(m => 
                        <MenuItem key={m} value={m}>{m}</MenuItem>
                        )
                }
            </Select>
        </div>

    )
            };