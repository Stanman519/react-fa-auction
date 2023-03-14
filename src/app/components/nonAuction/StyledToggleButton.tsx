import { ToggleButton } from "@mui/material";
import { styled } from "@mui/material/styles";
import { keyframes } from "@emotion/react";

const enterKeyframe = keyframes`
  0% {
    transform: scale(0);
    opacity: 0.1;
  }
  100% {
    transform: scale(1);
    opacity: 0.5;
  }
`;
const StyledToggleButton = styled(ToggleButton)`
  &.Mui-selected {
    background-color: rgba(205,92,92,1);
  }
  &.Mui-selected:hover {
    background-color: rgba(205,92,92,.9);
  }
  // &:hover {
  //   background-color: rgba(205,92,92,0.6);
  // }
  && .MuiTouchRipple-child {
    background-color: rgba(205,92,92,0.6);
  }
  && .MuiTouchRipple-rippleVisible {
    opacity: 0.5;
    animation-name: ${enterKeyframe};
    animation-duration: 550ms;
    animation-timing-function: ${({ theme}) =>
      theme.transitions.easing.easeInOut};
  }
`;
export default StyledToggleButton;