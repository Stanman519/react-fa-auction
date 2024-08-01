import { MouseEvent, useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Avatar, Button, Popover, Typography, useMediaQuery } from "@mui/material";
import { RootState } from "../../../store";
import { OverUnderPick } from "../../../services/GeneralApiSvc";

export const UserPickChartForTeam = (): JSX.Element => {
  const isMobile = useMediaQuery('(max-width:600px)');
  const { userPicks, selectedLine, franchiseWinTotals, otherUsers } = useSelector((state: RootState) => state.overUnders);
  const teamLine = franchiseWinTotals.find(f => f.id === selectedLine);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [pickSum, setPickSum] = useState<number>(0);
  const [popoverEl, setPopoverEl] = useState<HTMLDivElement | null>(null);
  const [groupedPicks, setGroupedPicks] = useState<Map<string, OverUnderPick[]>>(new Map());
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  useEffect(() => {

    const handleClickOutside = (event: Event) => {
      console.log('outside click?', event.target)
      console.log('ref tho', popoverEl)
      console.log(popoverEl?.contains(event.target as Node))
      if (!popoverEl?.contains(event.target as Node)) {
        handlePopoverClose();
      }
    };
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [popoverEl]);

  useEffect(() => {
    const sorted = userPicks
      .filter(p => p.lineId === selectedLine)
      .sort((a, b) => {
        const priority = (pick: OverUnderPick) => {
          if (pick.isOver === false) return 0;
          if (pick.isOver == null) return 1;
          if (pick.isOver === true) return 2;
          else return 0;
        };
        const isOverComparison = priority(a) - priority(b);
        if (isOverComparison !== 0) {
          return isOverComparison;
        }
        return a.lineAdjustment - b.lineAdjustment;
      });
    const grouped = new Map<string, OverUnderPick[]>();
    setPickSum(sorted.length)
    sorted.forEach(p => {
      if (teamLine !== undefined) {
        const key = p.isOver === true ? `O ${teamLine?.overUnder + p.lineAdjustment}` :
          p.isOver === false ? `U ${teamLine?.overUnder + p.lineAdjustment}` :
            "PASS";
        if (!grouped.has(key)) {
          grouped.set(key, []);
        }
        grouped.get(key)?.push(p);
      }
    });

    setGroupedPicks(grouped);
  }, [userPicks, selectedLine]);

  const handlePopoverOpen = (event: MouseEvent<HTMLElement>, pickId: number): void => {

    setAnchorEl(event.currentTarget);
    setHoveredId(pickId);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
    setHoveredId(null);
  };


  const popoverRef = useCallback((node: HTMLDivElement) => {
    if (node !== null) {
      setPopoverEl(node);
    }
  }, []);

  const getBgColor = (lineAdjustment: number, isOver?: boolean) => {
    if (isOver !== true && isOver !== false) return 'lightgray';
    if (!isOver) {
      return lineAdjustment === 0 ? '#ffcccb' : '#e57373';
    }
    if (isOver) {
      return lineAdjustment === 0 ? '#c8e6c9' : '#81c784';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', width: '80%' }}>
      {Array.from(groupedPicks.entries()).map(([key, picks], i) => { 
        
        return (
        <div key={key} style={{ marginBottom: 16, width: `${(picks.length / pickSum) * 100}%`, position: 'relative'  }}>
          <Typography
            variant="h6"
            style={{
              pointerEvents: 'none',
              position: 'absolute',
              fontWeight: '700',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              //backgroundColor: 'rgba(255, 255, 255, 0.2)',
              padding: '0 8px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              zIndex: 1,
            }}
          >
            {key}
          </Typography>
          <div style={{ display: 'flex', flexDirection: 'row'}}>

            {picks.map(p => {
              const user = otherUsers.find(u => u.ownerId === p.ownerId)
              return (
                <div
                  onMouseEnter={(e) => handlePopoverOpen(e, p.id ?? 0)}
                  onClick={isMobile ? (e) => handlePopoverOpen(e, p.id ?? 0) : undefined}
                  key={p.id}
                  style={{
                    borderStyle: 'solid',
                    borderColor: 'darkgray',
                    boxSizing: 'border-box',
                    borderWidth: 1,
                    backgroundColor: getBgColor(p.lineAdjustment, p.isOver),
                    position: 'relative',
                    height: 60,
                    width: `${(1 / picks.length) * 100}%`, // Uniform width for all rectangles
                  }}
                >
                  <div
                    id={`${p.id}`}

                    >
                  </div>

                  {anchorEl && <Popover
                    sx={{ pointerEvents: 'none' }}
                    ref={popoverRef} 
                    id={`mouse-over-popover-${p.id}`}
                    open={hoveredId === p.id}
                    anchorEl={anchorEl}
                    //@ts-ignore
                    container={anchorEl?.parentNode ?? null}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'center',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'center',
                    }}
                    onClose={(e,r) => {
                      console.log('reason', r)
                      handlePopoverClose()
                    }}

                    disableEnforceFocus
                    transitionDuration={0}  // Disable animation
                  // sx={{zIndex: 0}}
                  >
                    <div style={{ pointerEvents: 'all', display: 'flex', flexDirection: 'row' }}>
                      <img src={user?.avatar} referrerPolicy="no-referrer" style={{ height: 0, width: 0 }} />
                      <Button onClick={() => {console.log('clickity') }}> <Avatar src={user?.avatar} style={{ marginRight: 4 }} />  {user?.displayName}'s picks</Button>
                    </div>
                  </Popover>}
                </div>
              )
            })
            }

          </div>
        </div>
      )}
      )}
    </div>
  );
};

export default UserPickChartForTeam;
