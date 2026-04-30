import { updateLotWithFreshBid } from "../redux/actions/LotActions";
import { upsertHeadline } from "../redux/actions/HeadlineActions";
import { upsertQuote, removeQuote } from "../redux/actions/QuoteActions";
import { setupSignalRConnection } from "./signalRContex";


const url = process.env.REACT_APP_AUCTION_API_URL+'/auction-hub';


export const setupEventsHub = setupSignalRConnection(url, {
  FreshBid: updateLotWithFreshBid,
  NewHeadline: upsertHeadline,
  NewQuote: upsertQuote,
  QuoteRemoved: removeQuote,
});

export default () => (dispatch: any) => {
  dispatch(setupEventsHub); // dispatch is coming from Redux
};
