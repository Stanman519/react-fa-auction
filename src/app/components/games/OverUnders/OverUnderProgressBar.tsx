import { Slider, styled } from "@mui/material";
import React, { LegacyRef } from "react";

const CustomSlider = styled(Slider)(({ theme }) => ({
  "& .MuiSlider-thumb": {
    width: 18,
    height: 18,
    // backgroundColor: "transparent",
    "&:before": {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      //content: "", //'"😬"', // Default emoji
      fontSize: "24px",
      position: "absolute",
      top: 0,
      left: 0,
    },
  },
  "& .MuiSlider-thumb:hover": {
    boxShadow: "none",
  },
  "& .MuiSlider-thumb:click": {
    boxShadow: "none",
  },
  "& .MuiSlider-rail:click": {
    boxShadow: "none",
  },
  "& .MuiSlider-thumb:focus-visible": {
    outline: "none",
  },
  "& .MuiSlider-thumb.Mui-focusVisible": {
    boxShadow: "none",
  },
  "& .MuiSlider-track": {
    backgroundColor: theme.palette.primary.main,
    border: "none",
  },
  "& .MuiSlider-rail": {
    backgroundColor: theme.palette.grey[600],
  },
  "& .MuiSlider-valueLabel": {
    backgroundColor: theme.palette.primary.main,
  },
  "& .MuiSlider-root": {
    "&:active": {
      "& .MuiSlider-track:after": {
        content: "none",
      },
    },
  },
}));

interface ProgressSliderProps {
  currentValue: number;
  hasFailed: boolean;
  isOnTrack?: boolean;
  targetValue: number;
  marker: number;
  isOver: boolean;
}

export const OverUnderProgressBar: React.FC<ProgressSliderProps> = ({
  hasFailed,
  currentValue,
  targetValue,
  isOnTrack,
  marker,
  isOver,
}) => {
  const emoji = hasFailed
    ? "🚫"
    : currentValue >= targetValue
      ? "⭐"
      : isOnTrack === undefined
        ? ""
        : isOnTrack
          ? "😎"
          : "😞";
  const handleSliderClick = (event: React.MouseEvent<HTMLSpanElement>) => {
    event.preventDefault();
  };

  const correct = currentValue >= targetValue;
  return (
    <CustomSlider
      max={targetValue}
      valueLabelDisplay="auto"
      marks={[
        {
          value: 0,
          label: `${isOver ? "Win" : "Loss"} Progress`,
        },
        // { value: currentValue, label: currentValue },
        {
          value: marker,
          label: `target: ${targetValue}`,
        },
      ]}
      onClick={handleSliderClick}
      value={currentValue}
      sx={{
        "& .MuiSlider-markLabel.MuiSlider-markLabelActive": {
          "&[data-index='0']": {
            transform: "translateX(0%)",
          },
          "&[data-index='1']": {
            transform: correct ? "translateX(-75%)" : "translateX(0%)",
          },
        },
        "& .MuiSlider-markLabel:not(.MuiSlider-markLabelActive)": {
          transform: "translateX(-75%)",
        },

        "& .MuiSlider-mark": {
          color: "black",
          width: "3%",
          height: "20%",
        },
        "& .MuiSlider-thumb:before": {
          content: `"${emoji}"`,
          fontSize: 26,
          textShadow: "0px 1px 8px #6E6E6E",
        },
        "& .MuiSlider-thumb": {
          //transform: correct ? "translateX(-7%)" : "translateX(0%)",
          backgroundColor: emoji == "" ? "" : "transparent",
        },
      }}
    />
  );
};

const CustomValueLabel = React.forwardRef(function CustomValueLabel(
  props: any,
  ref: LegacyRef<HTMLSpanElement> | undefined,
) {
  const { children, open, value } = props;

  return (
    <span
      ref={ref}
      style={
        {
          // position: "absolute",
          // display: open ? "block" : "none",
          // top: -34,
          // backgroundColor: "rgba(0, 0, 0, 0.8)",
          // color: "#fff",
          // padding: "2px 4px",
          // borderRadius: 4,
          // fontSize: 14,
        }
      }
    >
      {value}
    </span>
  );
});
export default OverUnderProgressBar;
