import { updateLotWithFreshBid } from "../redux/actions/LotActions";
import { setupSignalRConnection } from "./signalRContex";


const url = process.env.REACT_APP_AUCTION_API_URL+'/auction-hub';


export const setupEventsHub = setupSignalRConnection(url, {
  FreshBid: updateLotWithFreshBid
});

export default () => (dispatch: any) => {
  dispatch(setupEventsHub); // dispatch is coming from Redux
};
