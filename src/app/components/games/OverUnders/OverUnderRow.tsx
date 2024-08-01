import { handleOverUnderRowUpdate } from "../../../redux/actions/OverUnderActions";
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { FranchiseWinTotal } from "../../../redux/reducers/OverUnderReducer";
import { Box, Paper, ToggleButton, ToggleButtonGroup, ToggleButtonProps, Typography, keyframes, useTheme } from "@mui/material";
import styled from "@emotion/styled";

export const OverUnderRow = ({ prop }: {prop: FranchiseWinTotal}): JSX.Element => {
  const dispatch = useDispatch();
  const [startTime, setStartTime] = useState<number | undefined>(undefined)
  const { userPick } = prop;
const {} = useTheme()

const onChange = (e: React.MouseEvent<HTMLElement>, newValue: boolean | '') => {
    if (newValue === userPick.isOver || newValue === null) return
    let newAdj = userPick.lineAdjustment;
    if (userPick.lineAdjustment !== 0) newAdj = 0;
    dispatch(handleOverUnderRowUpdate(prop.id, newAdj, newValue === '' ? undefined : newValue));
  };

//   const onDouble = () => {
//     if (userPick.isOver === null || userPick.isOver === undefined) return;
//     if (userPick.lineAdjustment !== 0) {
//       dispatch(handleOverUnderRowUpdate(prop.id, 0, userPick.isOver));
//       return;
//     }
//     const newAdj = userPick.isOver ? 1 : -1;
//     dispatch(handleOverUnderRowUpdate(prop.id, newAdj, userPick.isOver));
//   };
  const getBool = (str: string) => {
    switch (str?.toLowerCase()?.trim()){
        case 'true':
            return true;
        case 'false': 
            return false;
        default:
            return undefined
    }
  }

  const mouseDown = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    //@ts-ignore
    if (getBool(e.target.value) !== userPick.isOver || userPick.isOver === undefined) return
    if (userPick.isOver === null || userPick.isOver === undefined) return;
    setStartTime(Date.now())

  }

  const mouseUp = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (startTime === undefined) return
    if (Date.now() - (startTime ?? 0) < 1000) {
        setStartTime(undefined) 
        return
    }
    if (userPick.lineAdjustment !== 0) {
        dispatch(handleOverUnderRowUpdate(prop.id, 0, userPick.isOver))
        setStartTime(undefined)
        return
    }
    if (userPick.lineAdjustment == 0) {
        const newAdj = userPick.isOver ? 1 : -1;
        dispatch(handleOverUnderRowUpdate(prop.id, newAdj, userPick.isOver))
        setStartTime(undefined)
    }

  


}
  return (
    <Paper 
      elevation={3}
      sx={{
        width: 320,
        height: 150, // Fixed height for consistency
        p: 2,
        display: 'flex',
        transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 6,
        },
      }}
    >
      <Box sx={{ width: '33%', mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img 
          src={prop.franchise.logo} 
          alt={`${prop.franchise.city} ${prop.franchise.name} logo`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
          loading="lazy"
        />
      </Box>
      <Box sx={{ width: '60%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
          {prop.franchise.city} {prop.franchise.name}
        </Typography>
        <ToggleButtonGroup 
          color='info' 
          onChange={onChange} 
          exclusive 
          defaultValue={undefined} 
          value={userPick.isOver ?? ''}
          size='medium'
          orientation="horizontal"
          sx={{ width: '100%' }}
        >
          <ToggleButton 
            value={false}
            disabled={userPick.isOver === false}
          >
            {userPick.lineAdjustment === -1 ? 'Doubled Down!' : 'Under'}
          </ToggleButton>
          <ToggleButton 
            value={''}
            sx={{ backgroundColor: userPick.lineAdjustment !== 0 ? 'gold' : undefined }}
          >
            {prop.overUnder + userPick.lineAdjustment}
          </ToggleButton>
          <ToggleButton 
            value={true}
            disabled={userPick.isOver === true}
          >
            {userPick.lineAdjustment === 1 ? 'Doubled Up!' : 'Over'}
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
    </Paper>
  );
};
const ProgressBar = styled('div')(({ theme }) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    backgroundColor: 'rgba(0, 0, 255, 0.3)', // Progress bar color
    transition: 'width 0.1s linear',
  }));
  
  const CustomToggleButton = styled(ToggleButton)(({ theme }) => ({
    position: 'relative',
    overflow: 'hidden',
  }));






  const MyToggleButton = (props: ToggleButtonProps): JSX.Element => {
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
  
    const handleMouseDown = (event: React.MouseEvent<HTMLButtonElement>) => {
      startProgress();
      timeoutRef.current = window.setTimeout(() => {
        console.log('Long press action triggered'); // Replace with your long press action
      }, 1000);
  
      if (props.onMouseDown) {
        props.onMouseDown(event);
      }
    };
  
    const handleMouseUp = (event: React.MouseEvent<HTMLButtonElement>) => {
      stopProgress();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setProgress(0); // Reset progress
  
      if (props.onMouseUp) {
        props.onMouseUp(event);
      }
    };
  
    return (
      <CustomToggleButton
        {...props}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp} // To handle case when mouse leaves the button
      >
        {props.children}
        <ProgressBar style={{ width: `${progress}%` }} />
      </CustomToggleButton>
    );
  };
  


export default OverUnderRow;