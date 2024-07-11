import { LotBody } from '../components/lot/lot';
import { useEffect, useRef, useState } from 'react';
import { getInitialAuctionData } from '../redux/actions/FreeAgentActions';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { MenuBar } from '../components/menuBar';
import { Alert, Backdrop, CircularProgress, Snackbar, useTheme } from '@mui/material';
import { updateUI } from '../redux/actions/UiActions';
import signalR from '../signalR/socketMiddleware';
import { ChatClient } from '../services/ChatUtils';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { synchronizeAuth0WithDbLogin } from '../redux/actions/LoginActions';
import { NoActiveAuctions } from './noActiveAuctions';
import { FreeAgentGridModal } from './FreeAgentGridModal';
import { BidHistorySlab, PlayerBioSlab } from './lot/bioAndHistory';

function AuctionHome() {
  const theme = useTheme()
  const dispatch = useDispatch();
  const [reconSign, setReconSign] = useState<boolean>(false);
  const { user, isAuthenticated, loginWithRedirect, isLoading } = useAuth0();
  const activeLots = useSelector((state: RootState) => state.lots.filter(l => l.bid && !l.newNom))
  const newNom = useSelector((state: RootState) => state.lots.find(l => l.newNom))
  const lots = useSelector((state: RootState) => state.lots);
  const { error, errorText, modal } = useSelector((state: RootState) => state.ui)
  const loading = useSelector((state: RootState) => state.ui.isLoading)
  const navigate = useNavigate()
  const {hasReconnected} = useSelector((state: RootState) => state.signalR)
  // const { } = useSelector((state: RootState) => state.signalR.connection.)

  // useEffect(() => {
  //   const handleVisibilityChange = () => {
  //     if (document.visibilityState === 'visible') {
  //       // Reconnect SignalR
  //       if (connection) {
  //         connection.start()
  //           .then(() => {
  //             console.log('Reconnected!');
  //             // Optionally, fetch fresh data from the server
  //             fetchFreshBids();
  //           })
  //           .catch(e => console.log('Reconnection failed: ', e));
  //       }
  //     } else {
  //       if (connection) {
  //         connection.stop();
  //       }
  //     }
  //   };
  //   document.addEventListener('visibilitychange', handleVisibilityChange)
  //   return () => {
  //     document.removeEventListener('visibilitychange', handleVisibilityChange);
  //   };
  // }, [connection]);

  useEffect(() => {

    if (isLoading) return
    const checkUser = async () => {
      if (isAuthenticated && user?.sub) {
        dispatch(synchronizeAuth0WithDbLogin(user))

        dispatch(getInitialAuctionData(user.sub))
        dispatch(signalR())
      } else {
        await loginWithRedirect({ appState: { returnTo: '/auction' } });
      }
    }

    checkUser()
    return () => {
      ChatClient.getInstance().chatInstance.disconnectUser();
    }
  }, [isAuthenticated, loginWithRedirect, isLoading, user])


  useEffect(() => {
    if (hasReconnected) {
      setReconSign(true)
      setTimeout(() => setReconSign(false), 5000)
    }
  }, [hasReconnected])

  return (

    <div className="App" style={{ backgroundColor: theme.palette.background.default }}>
      <div className='menu-container'>
        <MenuBar barOptions={['chat', 'fa-auction', 'salary-league']} chatChannel={"messaging"}/>
      </div>
      {reconSign && <div> Reconnected. </div>}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {loading === 'full-screen' ?
          <div>
            <Backdrop
              sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
              open={loading === 'full-screen'}
            >
              <CircularProgress size={100} />
            </Backdrop>
          </div> :
          <div className='p-2'>
            {modal === 'bid-history-slab' && < BidHistorySlab />}
            < PlayerBioSlab />
            {modal === 'free-agent-grid' && <FreeAgentGridModal isOpen={modal === 'free-agent-grid'} />}
            {newNom && <LotBody lot={newNom} key={newNom.lotId} />}
            {activeLots.map(l => <LotBody lot={l} key={l.lotId} />)}
          </div>}
        {!newNom && activeLots.length === 0 && loading !== 'full-screen' &&
          <div style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            <NoActiveAuctions />
          </div>
        }

      </div>
      <Snackbar open={error === 'snackbar'} autoHideDuration={6000}>
        <Alert onClose={() => dispatch(updateUI({ error: undefined }))} severity="error" sx={{ width: '100%' }}>
          {errorText}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default AuctionHome;
