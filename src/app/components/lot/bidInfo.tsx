import { LoadingButton } from "@mui/lab";
import { Button, Dialog, DialogActions, DialogContent, Divider, Slide, Tooltip, Typography } from "@mui/material";
import { useEffect, forwardRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import UIfx from 'uifx'
import { makeThisLotStale } from "../../redux/actions/LotActions";
import { TransitionProps } from "@mui/material/transitions";
import { updateUI } from "../../redux/actions/UiActions";
import { RootState } from "../../store";


interface BidInfoProps {
    bidYears: number
    bidSalary: number
    highBidder: string
    lotId: number
    isFresh?: boolean
}

const Transition = forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement<any, any>;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});


export const BidInfo = ({ bidYears, bidSalary, highBidder, isFresh, lotId }: BidInfoProps): JSX.Element => {
    const dispatch = useDispatch()
    const capnWarning = process.env.PUBLIC_URL + '/ask_capn.jpg';
    const [confirmModal, setConfirmModal] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>();
    const { audioOn } = useSelector((state: RootState) => state.ui);
    const notification = require('../../../assets/sounds/Blow.mp3');
    const beep = new UIfx(notification, { volume: 1 })

    const handleSubmission = () => {
        setIsLoading(true);
        dispatch(askCapn({
            
        })
    }

    useEffect(() => {
        let timer: any
        if (isFresh) {
            if (audioOn) beep.play()
            timer = setTimeout(() => {
                dispatch(makeThisLotStale(lotId))
            }, 3500)
        }
        return () => {
            if (timer) clearTimeout(timer)
        };
    }, [isFresh])
    return (
        <div>
        <Tooltip title="Current highest bid" arrow placement='bottom'>
            <div style={{
                minHeight: 50,
                flexDirection: 'row',
                display: 'flex', alignItems: 'center', justifyContent: 'space-around', marginTop: 10
            }}>
                    <div/>
                    <div className={isFresh ? 'noti-text' : "bid-info-text"} >{highBidder}</div>
                    <Divider orientation="vertical" variant='middle' flexItem />
                    <div className={isFresh ? 'noti-text' : "bid-info-text"}>{bidYears} {bidYears === 1 ? 'year' : 'years'}</div>
                    <Divider orientation="vertical" variant='middle' flexItem />
                    <div className={isFresh ? 'noti-text' : "bid-info-text"}>${bidSalary}</div>
                    <div/>
            </div>
            
        </Tooltip>
        <Button onClick={() => dispatch(setConfirmModal(true))}>ASK CAP'N</Button>
        <Dialog
                open={confirmModal}
                TransitionComponent={Transition}
                keepMounted
            >
                <DialogContent style={{ paddingTop: 10 }}>
                    <div>
                        <img src={capnWarning} style={{ maxHeight: '30%', maxWidth: '30%', aspectRatio: 'auto' }} />
                    </div>
                    <Typography variant="h5" style={{ marginBottom: 5, textAlign: 'center' }}>
                        You have used 0 of your 3 free contract tips from me. Do you want to use one for this player?
                    </Typography> 
                    <Typography variant="h5" style={{ marginBottom: 5, textAlign: 'center' }}>
                        You have used all of your free contract tips.
                    </Typography>
                    <Typography variant="h5" style={{ marginBottom: 5, textAlign: 'center' }}>
                        You can get unlimited contract tips from me by sending $3 to the commish!
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button color='primary' onClick={() => setConfirmModal(false)} size='large' variant='contained'>Cancel</Button>
                    <LoadingButton loading={isLoading} color='success' style={{ marginLeft: 8 }} size='large' variant='contained' onClick={() => handleSubmission()}>Submit</LoadingButton>
                </DialogActions>
            </Dialog>
        </div>
    );
};