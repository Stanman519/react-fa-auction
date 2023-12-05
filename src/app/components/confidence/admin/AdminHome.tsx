import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../redux/reducers/RootReducer";
import { DecideMatchups } from "./DecideMatchups";
import { AddMatchups } from "./AddMatchups";
import { PropManagement } from "./PropManagement";


export function ConfidenceAdminHome() {


  return (
    <div className="flex flex-col justify-center p-5">

        <DecideMatchups /> 
        <AddMatchups/>
        <PropManagement />
    </div>
  );
}
