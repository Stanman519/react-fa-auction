import './App.css';
import { LotBody } from './app/components/lot/lot';
import { useEffect, useState } from 'react';
import AuctionApiSvc from './app/services/AuctionApiSvc';
import { updateFreeAgents } from './app/redux/actions/FreeAgentActions';
import { updateLots } from './app/redux/actions/LotActions';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './app/store';
import { MenuBar } from './app/components/menuBar';
import { updateOwners } from './app/redux/actions/OwnerActions';
import { Backdrop, Box, CircularProgress, Modal, useTheme } from '@mui/material';
import Register from './app/components/login/register';
import SignIn from './app/components/login/signIn';
import { updateUI } from './app/redux/actions/UiActions';

function App() {
  const dispatch = useDispatch();
  const getInitData = async () => AuctionApiSvc.pageLoad();
  const activeLots = useSelector((state: RootState) => state.lots.filter(l => l.bid && !l.newNom))
  const newNom = useSelector((state: RootState)=> state.lots.filter(l => l.newNom))
  const { modal } = useSelector((state: RootState) => state.ui)
  const theme = useTheme()
  const [backdropOpen, setBackdropOpen] = useState(true);
  const [width, setWidth] = useState(0);

  const handleClose = () => {
    setBackdropOpen(false);
  };
  const handleToggle = () => {
    setBackdropOpen(!backdropOpen);
  };

  useEffect(() => {
    const fetchData = async () => {
      const initData = await getInitData();
      dispatch(updateFreeAgents(initData.freeAgents));
      dispatch(updateLots(initData.lots))
      dispatch(updateOwners(initData.owners));
      setBackdropOpen(false);
    }
    fetchData().catch(console.error);
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
      <Modal
        open={modal != undefined}
        onClose={() => dispatch(updateUI({ modal: undefined }))}
      >
        <>
          {modal === 'signIn' && <SignIn />}
          {modal === 'register' && <Register />}
        </>
      </Modal>
    </div>
  );
}

export default App;
