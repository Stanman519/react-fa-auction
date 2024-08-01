import { useAuth0 } from "@auth0/auth0-react";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { Alert, Box, Button, Snackbar } from "@mui/material";
import "boarding.js/styles/main.css";
import "boarding.js/styles/themes/basic.css";
import { fetchAllUsers, fetchFranchiseWinTotals, fetchUserPicks, submitOverUnderPicks } from "../../../redux/actions/OverUnderActions";
import { OverUnderRow } from "./OverUnderRow";
import { MenuBar } from "../../menuBar";
import { Rules } from "../../confidence/Rules";
import { updateUI } from "../../../redux/actions/UiActions";
import { ChatClient } from "../../../services/ChatUtils";
import { RootState } from "../../../store";
import UserPickChartForTeam from "./UserPickChartForTeam";

function OverUnderHome({ isDemo = false }: { isDemo?: boolean }) {
    const dispatch = useDispatch();
    const { user, isAuthenticated, loginWithRedirect, isLoading } = useAuth0();
    const { modal, errorText } = useSelector((state: RootState) => state.ui)
    const { owner } = useSelector((state: RootState) => state.profile)
    const { franchiseWinTotals } = useSelector((state: RootState) => state.overUnders)
    const totalPicks = franchiseWinTotals.filter(p => p.userPick.isOver !== undefined).length
    const totalDoubles = franchiseWinTotals.filter(p => p.userPick.lineAdjustment !== 0).length

    const CURRENT_YEAR = 2024
    const CURRENT_LEAGUE = "NFL"

    useEffect(() => {
        if (isLoading || isDemo) return
        const checkUser = async () => {

            if (isAuthenticated && user?.sub) {
                dispatch(fetchFranchiseWinTotals(CURRENT_YEAR, CURRENT_LEAGUE))
                //TODO: store this in cookies because it is set once and saved?
                dispatch(fetchUserPicks(CURRENT_YEAR, CURRENT_LEAGUE))
                dispatch(fetchAllUsers())
            } else {
                await loginWithRedirect({ appState: { returnTo: '/over-under' } });
            }
        }
        checkUser()
        return () => {
            ChatClient.getInstance().chatInstance.disconnectUser();
        }
    }, [isAuthenticated, loginWithRedirect, isLoading, user, isDemo])



    return (
        <div className="flex flex-col justify-start items-center" style={{ overflowX: 'hidden', overflowY: 'hidden', minHeight: '100vh' }}>

            <MenuBar isDemo={isDemo} chatChannel={'overunder'} barOptions={['confidence', 'chat']} />
            <Rules />

            <UserPickChartForTeam />
            <div>Total Picks: {totalPicks}</div>
            <div>Total Double Up/Downs: {totalDoubles}</div>
            <Box sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
                justifyContent: 'center',
                p: 2,
                }}>
                {franchiseWinTotals.map(f => <OverUnderRow key={f.id} prop={f} />)}
                </Box>
            <Button variant='outlined' color='primary' disabled={(totalPicks !== 24 || totalDoubles !== 3)} 
            onClick={() => dispatch(submitOverUnderPicks(CURRENT_YEAR, CURRENT_LEAGUE))}>Submit Picks</Button>
            <Snackbar open={modal === 'confidence-submit-success'} autoHideDuration={800} onClose={() => dispatch(updateUI({ modal: undefined }))} >
                <Alert severity="success" onClose={() => dispatch(updateUI({ modal: undefined }))}>
                    Submission Complete!
                </Alert>
            </Snackbar>
            <Snackbar open={modal === 'error'} autoHideDuration={8000} onClose={() => {

                dispatch(updateUI({ modal: undefined }))
            }}>
                <Alert severity="error" onClose={() => dispatch(updateUI({ modal: undefined }))}>
                    {errorText}
                </Alert>
            </Snackbar>


        </div>
    );
}

export default OverUnderHome;
