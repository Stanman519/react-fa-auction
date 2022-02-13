import './App.css';
import { LotBody } from './app/components/lot/lot';
import { useEffect, useState } from 'react';
import AuctionApiSvc from './app/services/AuctionApiSvc';
import { useAppDispatch } from './app/hooks';
import { updateFreeAgents } from './app/redux/actions/FreeAgentActions';
import { updateLots } from './app/redux/actions/LotActions';
import { useSelector } from 'react-redux';
import { RootState } from './app/store';
import { MenuBar } from './app/components/menuBar';
import { updateOwners } from './app/redux/actions/OwnerActions';
import { Backdrop, useTheme } from '@mui/material';

function App() {
  const dispatch = useAppDispatch();
  const getInitData = async () => AuctionApiSvc.pageLoad();
  const activeLots = useSelector((state: RootState) => state.lots.filter(l => l.bid))
  const  theme  = useTheme()
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
    <div className="App">     
      <div className='menu-container'>
        <MenuBar/>   
      </div>
      {backdropOpen ? 
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={backdropOpen}
      ></Backdrop> :
      <div className='lot-container'>
        {activeLots.map(l => <LotBody lot={l} screenWidth={width} />)}  
      </div> }
      
    </div>
  );
}

export default App;
