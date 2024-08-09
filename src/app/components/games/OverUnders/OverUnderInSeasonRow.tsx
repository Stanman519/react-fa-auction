import { handleOverUnderRowUpdate } from "../../../redux/actions/OverUnderActions";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { FranchiseWinTotal } from "../../../redux/reducers/OverUnderReducer";
import {
  Box,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  ToggleButtonProps,
  Typography,
  keyframes,
  useTheme,
} from "@mui/material";
import styled from "@emotion/styled";

export const OverUnderInSeasonRow = ({
  prop,
}: {
  prop: FranchiseWinTotal;
}): JSX.Element => {
  const dispatch = useDispatch();
  const [startTime, setStartTime] = useState<number | undefined>(undefined);
  const { userPick } = prop;
  const {} = useTheme();

  return (
    <Paper
      elevation={3}
      sx={{
        width: 320,
        height: 120, // Fixed height for consistency
        p: 1,
        display: "flex",
        transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: 6,
        },
      }}
    >
      <Box
        sx={{
          width: "28%",
          mr: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src={prop.franchise.logo}
          alt={`${prop.franchise.city} ${prop.franchise.name} logo`}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
          loading="lazy"
        />
      </Box>
      <Box
        sx={{
          width: "60%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: "bold" }}>
          {prop.franchise.city} {prop.franchise.name}
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-end",
          }}
        >
          <div className="flex flex-col">
            <Typography>over 7.5</Typography>
            <Typography></Typography>
          </div>
          <div className="flex flex-col">
            <Typography>current wins</Typography>
            <Typography></Typography>
          </div>
        </Box>
      </Box>
    </Paper>
  );
};

export default OverUnderInSeasonRow;
