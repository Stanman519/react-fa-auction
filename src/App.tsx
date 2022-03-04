import './App.css';
import { LotBody } from './app/components/lot/lot';
import { useEffect, useState } from 'react';
import { getInitialData } from './app/redux/actions/FreeAgentActions';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './app/store';
import { MenuBar } from './app/components/menuBar';
import { Alert, Backdrop, CircularProgress, Modal, Snackbar, useTheme } from '@mui/material';
import Register from './app/components/login/register';
import SignIn from './app/components/login/signIn';
import { updateUI } from './app/redux/actions/UiActions';
import Cookies from 'universal-cookie/es6';
import { setupEventsHub } from './app/signalR/socketMiddleware';
import signalR from './app/signalR/socketMiddleware';
import { NoActiveAuctions } from './app/components/noActiveAuctions';

function App() {
  const dispatch = useDispatch();

  const activeLots = useSelector((state: RootState) => state.lots.filter(l => l.bid && !l.newNom))
  const newNom = useSelector((state: RootState)=> state.lots.filter(l => l.newNom))
  const { modal, error, errorText } = useSelector((state: RootState) => state.ui)
  const theme = useTheme()
  const [backdropOpen, setBackdropOpen] = useState(true);
  const [width, setWidth] = useState(0);
  const cookies = new Cookies();

  useEffect(() => {
    cookies.get('token') ? dispatch(getInitialData(cookies.get('token'))) : dispatch(getInitialData())
    dispatch(signalR())
    setBackdropOpen(false);
  }, [])

  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth)
    }
    window.addEventListener("resize", handleResize)
    handleResize()
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [setWidth])

  return (
    <div className="App" style={{backgroundColor: theme.palette.background.default}}>
      
      <div className='menu-container'>
        <MenuBar />
      </div>
      <div style={{display: 'flex', justifyContent: 'center'}}>
        {backdropOpen ?
          <>
            <Backdrop
              sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
              open={backdropOpen}
            >
              <CircularProgress size={100} />
            </Backdrop>
          </> :
          <div className='lot-container'>
            {newNom.length > 0 && newNom.map(l => <LotBody lot={l} screenWidth={width} key={l.lotId}/>)}
            {activeLots.map(l => <LotBody lot={l} screenWidth={width} key={l.lotId}/>)}
          </div>}
        {newNom.length === 0 && activeLots.length === 0 && 
        <div style={{alignItems: 'center', justifyContent: 'center', flex: 1}}>
          <NoActiveAuctions />
        </div>
        }
      </div>
      <Modal
        open={modal !== undefined}
        onClose={() => dispatch(updateUI({ modal: undefined }))}
      >
        <>
          {modal === 'signIn' && <SignIn />}
          {modal === 'register' && <Register />}
        </>
      </Modal>
      <Snackbar open={error === 'snackbar'} autoHideDuration={6000}>
        <Alert onClose={() => dispatch(updateUI({error: undefined}))} severity="error" sx={{ width: '100%' }}>
          {errorText}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default App;
