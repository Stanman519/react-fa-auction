import { handleOverUnderRowUpdate } from "../../../redux/actions/OverUnderActions";
import React, { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { FranchiseWinTotal } from "../../../redux/reducers/OverUnderReducer";
import {
  Box,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  ToggleButtonProps,
  Typography,
  useTheme,
} from "@mui/material";
import styled from "@emotion/styled";

export const OverUnderRow = ({
  prop,
}: {
  prop: FranchiseWinTotal;
}): JSX.Element => {
  const dispatch = useDispatch();
  const [startTime, setStartTime] = useState<number | undefined>(undefined);
  const { userPick } = prop;
  const {} = useTheme();

  const onChange = (
    e: React.MouseEvent<HTMLElement>,
    newValue: boolean | "",
  ) => {
    if (newValue === "")
      dispatch(handleOverUnderRowUpdate(prop.id, 0, undefined));
  };

  const getBool = (str: string) => {
    switch (str?.toLowerCase()?.trim()) {
      case "true":
        return true;
      case "false":
        return false;
      default:
        return undefined;
    }
  };

  const mouseDown = (
    e:
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
      | React.TouchEvent<HTMLButtonElement>,
  ) => {
    if (
      //@ts-ignore
      getBool(e.target.value) !== userPick.isOver ||
      userPick.isOver === undefined
    )
      return;
    if (userPick.isOver === null || userPick.isOver === undefined) return;
    setStartTime(Date.now());
  };

  const mouseUp = (
    e:
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
      | React.TouchEvent<HTMLButtonElement>,
  ) => {
    const target = e.target as HTMLButtonElement;
    const { isOver, lineAdjustment } = userPick;
    if (isOver === undefined || isOver.toString() !== target.value) {
      dispatch(handleOverUnderRowUpdate(prop.id, 0, target.value === "true"));
      return;
    }
    if (startTime === undefined) return;
    if (
      Date.now() - (startTime ?? 0) < 80 &&
      ((target.value === "true" && isOver) ||
        (target.value === "false" && isOver === false))
    ) {
      setStartTime(undefined);
      dispatch(handleOverUnderRowUpdate(prop.id, 0, undefined));
      return;
    }
    if (Date.now() - (startTime ?? 0) < 1000) {
      setStartTime(undefined);
      return;
    }
    if (lineAdjustment !== 0) {
      dispatch(handleOverUnderRowUpdate(prop.id, 0, isOver));
      setStartTime(undefined);
      return;
    }
    if (lineAdjustment == 0) {
      const newAdj = userPick.isOver ? 1 : -1;
      dispatch(handleOverUnderRowUpdate(prop.id, newAdj, isOver));
      setStartTime(undefined);
    }
  };
  return (
    <Paper
      elevation={3}
      sx={{
        width: 330,
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
          width: "72%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: "bold" }}>
          {prop.franchise.city} {prop.franchise.name}
        </Typography>
        <ToggleButtonGroup
          color="info"
          onChange={onChange}
          exclusive
          defaultValue={undefined}
          value={userPick.isOver ?? ""}
        >
          <MyToggleButton
            themecolor="salmon"
            selected={userPick.isOver === false}
            disableTouchRipple={userPick.isOver === false}
            onMouseDown={(e) => mouseDown(e)}
            onTouchStart={(e) => mouseDown(e)}
            onMouseUp={(e) => mouseUp(e)}
            onTouchEnd={(e) => mouseUp(e)}
            value={false}
          >
            {userPick.lineAdjustment === -1 ? "Under -1" : "Under"}
          </MyToggleButton>
          <ToggleButton
            style={{
              padding: 8,
              fontSize: 18,
              fontWeight:
                prop.userPick.lineAdjustment !== 0 ? "bolder" : undefined,
              backgroundColor:
                prop.userPick.lineAdjustment !== 0 ? "gold" : undefined,
              color: prop.userPick.lineAdjustment !== 0 ? "black" : undefined,
            }}
            value={""}
          >
            {prop.overUnder + prop.userPick.lineAdjustment}
          </ToggleButton>
          <MyToggleButton
            themecolor="green"
            selected={userPick.isOver === true}
            disableTouchRipple={userPick.isOver === true}
            onMouseDown={(e) => mouseDown(e)}
            onTouchStart={(e) => mouseDown(e)}
            onMouseUp={(e) => mouseUp(e)}
            onTouchEnd={(e) => mouseUp(e)}
            value={true}
          >
            {userPick.lineAdjustment === 1 ? "Over +1" : "Over"}
          </MyToggleButton>
        </ToggleButtonGroup>
      </Box>
    </Paper>
  );
};

declare module "@mui/material/ToggleButton" {
  interface ToggleButtonPropsColorOverrides {
    green: true;
    salmon: true;
  }
}
const ProgressBar = styled("div")(
  ({ themecolor }: { themecolor: "salmon" | "green" }) => ({
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    backgroundColor:
      themecolor === "salmon" ? "rgba(155, 0, 0, 0.3)" : "rgba(0, 155, 0, 0.3)", // Progress bar color
    transition: "width 0.1s linear",
  }),
);

const CustomToggleButton = styled(ToggleButton)(({ theme }) => ({
  position: "relative",
  overflow: "hidden",
}));

interface MyToggButtProps extends ToggleButtonProps {
  selected: boolean;
  themecolor: "salmon" | "green";
}

const MyToggleButton = (props: MyToggButtProps): JSX.Element => {
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const theme = useTheme();
  const startProgress = () => {
    intervalRef.current = window.setInterval(() => {
      setProgress((prev) => Math.min(prev + 10, 100));
    }, 100);
  };

  const stopProgress = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleMouseDown = (
    event:
      | React.MouseEvent<HTMLButtonElement>
      | React.TouchEvent<HTMLButtonElement>,
  ) => {
    if (props.selected) {
      startProgress();
    }
    if (props.onMouseDown && event.type === "mousedown") {
      props.onMouseDown(event as React.MouseEvent<HTMLButtonElement>);
    }

    if (props.onTouchStart && event.type === "touchstart") {
      props.onTouchStart(event as React.TouchEvent<HTMLButtonElement>);
    }
  };

  const handleMouseUp = (
    event:
      | React.MouseEvent<HTMLButtonElement>
      | React.TouchEvent<HTMLButtonElement>,
  ) => {
    stopProgress();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setProgress(0); // Reset progress

    if (props.onMouseUp && event.type === "mouseup") {
      props.onMouseUp(event as React.MouseEvent<HTMLButtonElement>);
    }

    if (props.onTouchEnd && event.type === "touchend") {
      props.onTouchEnd(event as React.TouchEvent<HTMLButtonElement>);
    }
  };

  return (
    <CustomToggleButton
      {...props}
      color={props.themecolor}
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp} // To handle case when mouse leaves the button
    >
      {props.children}
      <ProgressBar
        themecolor={props.themecolor}
        style={{ width: `${progress}%` }}
      />
    </CustomToggleButton>
  );
};

export default OverUnderRow;
