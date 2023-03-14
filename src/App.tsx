import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useTheme } from '@mui/material';
import AuctionHome from './app/components/AuctionHome';
import HomeBase from './app/components/HomeBase';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { MenuBar } from './app/components/menuBar';
import Auth0ProviderWithHistory from './app/auth/auth0-provider-with-history';
import { LandingPage } from './app/components/nonAuction/LandingPage';


function App() {
  const theme = useTheme()
  const dispatch = useDispatch();
  const auctionIsActive = false;

  useEffect(() => {

    return () => {
    }
  }, [])

  return (
    <div className="App" style={{ backgroundColor: theme.palette.background.default }}>

      <BrowserRouter>
        <Auth0ProviderWithHistory

          // authorizationParams={{
          //   redirect_uri: window.location.origin
          // }}
        >

          <Routes>
            <Route path='/' element={<LandingPage />} />
            <Route path='/home' element={<HomeBase />} />
            <Route path='/auction' element={<AuctionHome />} />
          </Routes>
        </Auth0ProviderWithHistory>
      </BrowserRouter>
    </div>
  );
}

export default App;
