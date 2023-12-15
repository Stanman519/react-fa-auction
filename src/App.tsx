import { useEffect } from 'react';
import { useTheme } from '@mui/material';
import AuctionHome from './app/components/AuctionHome';
import HomeBase from './app/components/HomeBase';
//import "./index.css"
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Auth0ProviderWithHistory from './app/auth/auth0-provider-with-history';
import { LandingPage } from './app/components/nonAuction/LandingPage';
import GamesHome from './app/components/games/GamesHome';
import { ConfidenceAdminHome } from './app/components/confidence/admin/AdminHome';
import { TermsOfService } from './app/components/legal/TermsOfService';
import { PrivacyPolicy } from './app/components/legal/PrivacyPolicy';


function App() {
  const theme = useTheme()

  useEffect(() => {

    return () => {
    }
  }, [])

  return (
    <div className="min-h-screen max-w-screen" style={{ backgroundColor: theme.palette.background.default }}> 

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
            <Route path='/games' element={<GamesHome />}/>
            <Route path='/demo' element={<GamesHome isDemo/>}/>
            <Route path='/admin' element={<ConfidenceAdminHome />} />
            
            <Route path='/terms-of-service' element={<TermsOfService />} />
            
            <Route path='/privacy-policy' element={<PrivacyPolicy />} />
          </Routes> 
        </Auth0ProviderWithHistory>
      </BrowserRouter>
    </div>
  );
}

export default App;
