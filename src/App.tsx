import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useTheme } from '@mui/material';
import AuctionHome from './app/components/AuctionHome';
import HomeBase from './app/components/HomeBase';

function App() {
  const theme = useTheme()
  const dispatch = useDispatch();
  const auctionIsActive = false;

  useEffect(() => {

    return () => {
    }
  }, [])

  return (
    <div className="App" style={{backgroundColor: theme.palette.background.default}}>
      {auctionIsActive ? 
        <AuctionHome/>
        :
        <HomeBase />
      }
    </div>
  );
}

export default App;
