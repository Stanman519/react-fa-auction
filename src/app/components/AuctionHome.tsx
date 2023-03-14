import '../../App.css';
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
import Cookies from 'universal-cookie/es6';
import signalR from '../signalR/socketMiddleware';
import { NoActiveAuctions } from './noActiveAuctions';
import { FAChatWindow } from './chat';
import { ChatClient } from '../services/ChatUtils';

function AuctionHome() {
  const theme = useTheme()
  const dispatch = useDispatch();
  const activeLots = useSelector((state: RootState) => state.lots.filter(l => l.bid && !l.newNom))
  const newNom = useSelector((state: RootState)=> state.lots.filter(l => l.newNom))
  const {isMobile} = useSelector((state: RootState) => state.ui)
  const { modal, error, errorText, isLoading, chatOpen } = useSelector((state: RootState) => state.ui)
  const cookies = new Cookies();

  useEffect(() => {
    cookies.get('token') ? dispatch(getInitialData(cookies.get('token'))) : dispatch(getInitialData())
    dispatch(signalR())
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
        {isLoading == 'fullscreen' ?
          <div>
            <Backdrop
              sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
              open={isLoading == 'fullscreen'}
            >
              <CircularProgress size={100} />
            </Backdrop>
          </div> :
          <div className='lot-container'>
            {newNom.length > 0 && newNom.map(l => <LotBody lot={l} key={l.lotId}/>)}
            {activeLots.map(l => <LotBody lot={l} key={l.lotId}/>)}
          </div>}
        {newNom.length === 0 && activeLots.length === 0 && isLoading != 'fullscreen' && 
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
