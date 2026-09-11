import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../redux/reducers/RootReducer";
import { DecideMatchups } from "./DecideMatchups";
import { AddMatchups } from "./AddMatchups";
import { PropManagement } from "./PropManagement";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { OwnerPaymentManagement } from "./OwnerPaymentManagement";
import { OverUnderPaymentManagement } from "./OverUnderPaymentManagement";
import { FranchiseTagAdmin } from "./FranchiseTagAdmin";
import { SalaryCapTrueUpAdmin } from "./SalaryCapTrueUpAdmin";
import { AuctionPauseAdmin } from "./AuctionPauseAdmin";
import { OverUnderWinsAdmin } from "./OverUnderWinsAdmin";
import { MenuBar } from "../../menuBar";
import { Box } from "@mui/material";

export function ConfidenceAdminHome() {
  const { owner } = useSelector((state: RootState) => state.profile);
  const { user } = useAuth0();
  const nav = useNavigate();
  useEffect(() => {
    if (!user || !user.sub?.includes("118311468702754688467")) nav("/");
  }, []);

  return (
    <Box
      className="flex flex-col justify-center p-5"
      sx={{ bgcolor: "background.default", color: "text.primary", minHeight: "100vh" }}
    >
      <MenuBar />
      <DecideMatchups />
      <AddMatchups />
      <PropManagement />
      <OwnerPaymentManagement />
      <OverUnderPaymentManagement />
      <AuctionPauseAdmin />
      <FranchiseTagAdmin />
      <SalaryCapTrueUpAdmin />
      <OverUnderWinsAdmin />
    </Box>
  );
}
