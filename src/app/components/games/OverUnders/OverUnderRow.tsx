import { handleOverUnderRowUpdate } from "../../../redux/actions/OverUnderActions";
import React, { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { FranchiseWinTotal } from "../../../redux/reducers/OverUnderReducer";
import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  ToggleButtonProps,
  Typography,
} from "@mui/material";
import styled from "@emotion/styled";
import { terminal as T, fontStacks } from "../../../../theme";

export const OverUnderRow = ({
  prop,
}: {
  prop: FranchiseWinTotal;
}): JSX.Element => {
  const dispatch = useDispatch();
  const [startTime, setStartTime] = useState<number | undefined>(undefined);
  const { userPick } = prop;
  const isDouble = userPick.lineAdjustment !== 0;

  const onChange = (
    e: React.MouseEvent<HTMLElement>,
    newValue: boolean | "",
  ) => {
    if (newValue === "")
      dispatch(handleOverUnderRowUpdate(prop.id, 0, undefined));
  };

  const mouseDown = (
    e:
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
      | React.TouchEvent<HTMLButtonElement>,
  ) => {
    setStartTime(Date.now());
  };
  const [isTouchEvent, setIsTouchEvent] = useState(false);

  const handleMouseDown = (
    e:
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
      | React.TouchEvent<HTMLButtonElement>,
  ) => {
    if (isTouchEvent) return; // Ignore mouse events if triggered by a touch
    mouseDown(e);
  };

  const handleTouchStart = (
    e:
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
      | React.TouchEvent<HTMLButtonElement>,
  ) => {
    setIsTouchEvent(true); // Set flag when a touch event is detected
    e.preventDefault(); // Prevent subsequent mouse events from firing
    mouseDown(e);
  };

  const handleMouseUp = (
    e:
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
      | React.TouchEvent<HTMLButtonElement>,
  ) => {
    if (isTouchEvent) {
      setIsTouchEvent(false); // Reset the flag after touch interaction ends
      return;
    }
    mouseUp(e);
  };

  const handleTouchEnd = (
    e:
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
      | React.TouchEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault(); // Prevent subsequent mouse events from firing
    mouseUp(e);
  };
  const mouseUp = (
    e:
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
      | React.TouchEvent<HTMLButtonElement>,
  ) => {
    let target = e.target as HTMLButtonElement;
    if (!target.value && target.parentElement) {
      // when you hold down the target is now the progress bar
      target = target.parentElement as HTMLButtonElement;
    }

    const { isOver, lineAdjustment } = userPick;
    // if current is undefined or tapping a different button than selected, dont worry about time
    if (isOver === undefined || isOver.toString() !== target.value) {
      setStartTime(undefined);
      dispatch(handleOverUnderRowUpdate(prop.id, 0, target.value === "true"));
      return;
    }
    if (Date.now() - (startTime ?? 0) < 200) {
      // Regular tap of non-middle button
      if (
        (target.value === "true" && isOver) || //tapping same button as selected
        (target.value === "false" && isOver === false)
      ) {
        setStartTime(undefined);
        dispatch(handleOverUnderRowUpdate(prop.id, 0, undefined));
        return;
      }
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
    <Box
      sx={{
        background: T.panel,
        border: `1px solid ${isDouble ? T.amber : T.line}`,
        minHeight: 96,
        p: 1.25,
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        "&:hover": { background: T.panel2 },
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src={prop.franchise.logo}
          alt={`${prop.franchise.city} ${prop.franchise.name} logo`}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
          loading="lazy"
        />
      </Box>
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          gap: 0.75,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Typography
            sx={{
              fontFamily: fontStacks.sans,
              fontSize: 13,
              fontWeight: 600,
              color: T.text,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {prop.franchise.city} {prop.franchise.name}
          </Typography>
          {isDouble && (
            <Box
              component="span"
              sx={{
                fontFamily: fontStacks.mono,
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.08em",
                background: T.amber,
                color: "#000",
                px: 0.5,
                flexShrink: 0,
              }}
            >
              2X
            </Box>
          )}
        </Box>
        <ToggleButtonGroup
          onChange={onChange}
          exclusive
          defaultValue={undefined}
          value={userPick.isOver ?? ""}
          sx={{ width: "100%" }}
        >
          <MyToggleButton
            themecolor="salmon"
            selected={userPick.isOver === false}
            disableTouchRipple={userPick.isOver === false}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onMouseUp={handleMouseUp}
            onTouchEnd={handleTouchEnd}
            value={false}
          >
            {userPick.lineAdjustment === -1 ? "UNDER -1" : "UNDER"}
          </MyToggleButton>
          <ToggleButton
            disableRipple
            sx={{
              px: 1.5,
              py: 0.5,
              flexShrink: 0,
              fontFamily: fontStacks.mono,
              fontSize: 15,
              fontWeight: 700,
              lineHeight: 1.2,
              border: `1px solid ${isDouble ? T.amber : T.line}`,
              borderRadius: 0,
              cursor: "default",
              background: isDouble ? T.amber : "transparent",
              color: isDouble ? "#000" : T.text,
              "&.Mui-selected, &:hover": {
                background: isDouble ? T.amber : "transparent",
              },
              // ToggleButtonGroup's own CSS forces middle/last buttons'
              // border-left to transparent (to fake a shared 1px divider) at
              // higher specificity than this sx's `border` shorthand — the
              // `&&` here matches that specificity so our color actually wins.
              "&&": {
                borderLeftColor: isDouble ? T.amber : T.line,
              },
            }}
            value={""}
          >
            {prop.overUnder + prop.userPick.lineAdjustment}
          </ToggleButton>
          <MyToggleButton
            themecolor="green"
            selected={userPick.isOver === true}
            disableTouchRipple={userPick.isOver === true}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onMouseUp={handleMouseUp}
            onTouchEnd={handleTouchEnd}
            value={true}
          >
            {userPick.lineAdjustment === 1 ? "OVER +1" : "OVER"}
          </MyToggleButton>
        </ToggleButtonGroup>
      </Box>
    </Box>
  );
};

declare module "@mui/material/ToggleButton" {
  interface ToggleButtonPropsColorOverrides {
    green: true;
    salmon: true;
  }
}
const ProgressBar = styled("div")<{ themecolor: "salmon" | "green" }>(
  ({ themecolor }) => ({
    position: "absolute" as const,
    top: 0,
    left: 0,
    height: "100%",
    backgroundColor: themecolor === "salmon" ? T.redDim : T.limeDim,
    transition: "width 0.1s linear",
    pointerEvents: "none",
  }),
);

const CustomToggleButton = styled(ToggleButton)({
  position: "relative",
  overflow: "hidden",
});

interface MyToggButtProps extends ToggleButtonProps {
  selected: boolean;
  themecolor: "salmon" | "green";
}

const MyToggleButton = (props: MyToggButtProps): JSX.Element => {
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
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

  const accent = props.themecolor === "salmon" ? T.red : T.lime;
  const accentDim = props.themecolor === "salmon" ? T.redDim : T.limeDim;

  return (
    <CustomToggleButton
      {...props}
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp} // To handle case when mouse leaves the button
      sx={{
        flex: 1,
        py: 0.5,
        px: 1,
        borderRadius: 0,
        fontFamily: fontStacks.mono,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.08em",
        border: `1px solid ${props.selected ? accent : T.line}`,
        color: props.selected ? accent : T.textDim,
        background: props.selected ? accentDim : "transparent",
        "&.Mui-selected": {
          color: accent,
          background: accentDim,
          "&:hover": { background: accentDim },
        },
        "&:hover": {
          background: props.selected ? accentDim : T.panel2,
          borderColor: props.selected ? accent : T.lineBold,
        },
        // ToggleButtonGroup's own CSS forces the last button's border-left to
        // transparent (to fake a shared 1px divider) at higher specificity
        // than this sx's `border` shorthand — `&&` matches that specificity
        // so the accent color actually renders on the OVER button's left edge.
        "&&": {
          borderLeftColor: props.selected ? accent : T.line,
        },
      }}
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
