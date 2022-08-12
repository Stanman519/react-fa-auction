import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loadDataForHomeBase } from "../redux/actions/TransactionActions";
import GeneralApiSvc from "../services/GeneralApiSvc";
import DeadCapTable from "./nonAuction/DeadCapTable";
import CapDetails from "./nonAuction/DeadCapTable";


const HomeBase = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(loadDataForHomeBase())
    }, [])    
    return(
        <div className="background">
          <div className="App">
            <div className="left-side">
              <DeadCapTable/>
              {/* <TriTable /> */}
            </div>
              <div className="right-side">
                <CapDetails /> 
              </div>
          </div>
        </div>
    );
}
export default HomeBase;
