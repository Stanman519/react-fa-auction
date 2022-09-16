import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loadDataForHomeBase } from "../redux/actions/TransactionActions";
import GeneralApiSvc from "../services/GeneralApiSvc";
import DeadCapTable from "./nonAuction/DeadCapTable";
import { TeamCapDetails } from "./nonAuction/teamCapDetails";
import TriTable from "./nonAuction/TriTable";



const HomeBase = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(loadDataForHomeBase())
    }, [])    
    return(
        <div>
          <div style={{display: 'flex', flexDirection: 'row'}}>
            <div style={{display: 'flex', flexDirection: 'column', flex: 3}}>
              <DeadCapTable/>
              <TriTable />
            </div>
            <div style={{ flex: 1}}>
              <TeamCapDetails />
            </div>
          </div>
        </div>
    );
}
export default HomeBase;
