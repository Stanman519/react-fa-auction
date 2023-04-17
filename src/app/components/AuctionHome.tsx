import { LotBody } from '../components/lot/lot';
import { useEffect, useRef, useState } from 'react';
import { getInitialData } from '../redux/actions/FreeAgentActions';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { MenuBar } from '../components/menuBar';
import { Alert, Backdrop, CircularProgress, Modal, Snackbar, useTheme } from '@mui/material';
import Register from '../components/login/register';
import SignIn from '../components/login/signIn';
import { updateUI } from '../redux/actions/UiActions';

import signalR from '../signalR/socketMiddleware';
import { NoActiveAuctions } from './noActiveAuctions';
import { FAChatWindow } from './chat';
import { ChatClient } from '../services/ChatUtils';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';

function AuctionHome() {
  const theme = useTheme()
  const dispatch = useDispatch();
  const { user, isAuthenticated, loginWithRedirect } = useAuth0();
  const activeLots = useSelector((state: RootState) => state.lots.filter(l => l.bid && !l.newNom))
  const newNom = useSelector((state: RootState)=> state.lots.find(l => l.newNom))
  const {isMobile} = useSelector((state: RootState) => state.ui)
  const { modal, error, errorText, isLoading, chatOpen } = useSelector((state: RootState) => state.ui)
  const navigate = useNavigate()

  useEffect(() => {
    const checkUser = async () => {
      if (isAuthenticated && user?.sub) {
        dispatch(getInitialData())
        dispatch(signalR())
      } else {
        navigate(`/`, {state: {from: 'auction'}} );
      }
  }
  checkUser()
    return () => {
        ChatClient.getInstance().chatInstance.disconnectUser();

    }
  }, [])

  return (
    <div className="App" style={{backgroundColor: theme.palette.background.default}}>
                <div className='menu-container'>
            <MenuBar/>
          </div>

      <div style={{display: 'flex', justifyContent: 'center'}}>
        {isLoading === 'full-screen' ?
          <div>
            <Backdrop
              sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
              open={isLoading === 'full-screen'}
            >
              <CircularProgress size={100} />
            </Backdrop>
          </div> :
          <div className='p-2'>
            {newNom && <LotBody lot={newNom} key={newNom.lotId}/>}
            {activeLots.map(l => <LotBody lot={l} key={l.lotId}/>)}
          </div>}
        {!newNom && activeLots.length === 0 && isLoading !== 'full-screen' && 
        <div style={{alignItems: 'center', justifyContent: 'center', flex: 1}}>
          <NoActiveAuctions />
        </div>
        }
        
      </div>
      {/* {chatOpen && <FAChatWindow />} */}
      <Modal
        open={modal !== undefined}
        onClose={() => dispatch(updateUI({modal: undefined, isMobile }))}
      >
        <>
          {modal === 'signIn' && <SignIn origin={'auction'} />}
          {modal === 'register' && <Register />}
        </>
      </Modal>
      <Snackbar open={error === 'snackbar'} autoHideDuration={6000}>
        <Alert onClose={() => dispatch(updateUI({isMobile, error: undefined}))} severity="error" sx={{ width: '100%' }}>
          {errorText}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default AuctionHome;
