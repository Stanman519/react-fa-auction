import { LoadingButton } from "@mui/lab";
import { Button, Dialog, DialogActions, DialogContent, Divider, Slide, Tooltip, Typography } from "@mui/material";
import { useEffect, forwardRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import UIfx from 'uifx'
import { makeThisLotStale } from "../../redux/actions/LotActions";
import { TransitionProps } from "@mui/material/transitions";
import { RootState } from "../../store";
import { askCapn } from "../../redux/actions/LoginActions";
import { Lot } from "../../redux/reducers/LotReducer";


interface BidInfoProps {
    lot: Lot
}

const Transition = forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement<any, any>;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});


export const BidInfo = ({ lot }: BidInfoProps): JSX.Element => {
    const dispatch = useDispatch()
    const capnWarning = process.env.PUBLIC_URL + '/ask_capn.jpg';
    const { profile } = useSelector((state: RootState) => state)
    const [confirmModal, setConfirmModal] = useState<boolean>(false);
    const [hasAsked, setHasAsked] = useState<boolean>(profile?.tipsUsed?.some(p => p.mflId == lot.bid?.player?.mflId))
    let tip = hasAsked ? profile.tipsUsed?.find(t => t.mflId == lot.bid?.player.mflId) : undefined

    const [isLoading, setIsLoading] = useState<boolean>();
    const { audioOn } = useSelector((state: RootState) => state.ui);
    const notification = require('../../../assets/sounds/Blow.mp3');
    const beep = new UIfx(notification, { volume: 1 })

    const isEligibleForFreeTip = (): boolean => {
        if (profile.premium) return true
        if (!profile.tipsUsed) return false
        if (profile.tipsUsed.length === 0) return true
        return false;
    }


    const handleSubmission = () => {
        if (!profile.ownername) return;
        setIsLoading(true);
        dispatch(askCapn(lot?.bid?.player?.mflId!, lot?.bid?.player?.position!, lot?.bid?.player?.age!))
        setHasAsked(true)
        setIsLoading(false)
        setConfirmModal(false)
    }
    const checkProfileForPremium = () => {
        if (!profile.ownername) return
        profile.premium ? handleSubmission() : setConfirmModal(true)
    }

    useEffect(() => {
        let timer: any
        if (lot?.isFresh) {
            if (audioOn) beep.play()
            timer = setTimeout(() => {
                dispatch(makeThisLotStale(lot?.lotId))
            }, 10000)
        }
        return () => {
            if (timer) clearTimeout(timer)
        };
    }, [lot?.isFresh])
    return (
        <div>
        <Tooltip title="Current highest bid" arrow placement='right'>
            <div style={{
                minHeight: 50,
                flexDirection: 'row',
                display: 'flex', alignItems: 'center', justifyContent: 'space-around', marginTop: 10
            }}>
                    <div/>
                    <div className={lot?.isFresh ? 'noti-text' : "bid-info-text"}>{lot?.bid?.ownername}</div>
                    <Divider orientation="vertical" variant='middle' flexItem />
                    <div className={lot?.isFresh ? 'noti-text' : "bid-info-text"}>{lot?.bid?.bidLength} {lot?.bid?.bidLength === 1 ? 'year' : 'years'}</div>
                    <Divider orientation="vertical" variant='middle' flexItem />
                    <div className={lot?.isFresh ? 'noti-text' : "bid-info-text"}>${lot?.bid?.bidSalary}</div>
                    <div/>
            </div>
            
        </Tooltip>
        <Divider variant='middle' flexItem />
        {hasAsked ? 
            <div style={{fontSize: 'medium', padding:12}}>Cap'n suggests: ${tip?.suggestion}, {tip?.yearMin}{tip?.yearMin != tip?.yearMax ? `-${tip?.yearMax} years`: ''}</div> 
            :
         <Button 
         style={{borderWidth: 1, margin: 8, width: '80%'}} 
         onClick={() => checkProfileForPremium()}>ASK CAP'N</Button>
        }
        <Dialog
                open={confirmModal}
                TransitionComponent={Transition}
                keepMounted
            >
                <DialogContent style={{ paddingTop: 10 }}>
                    <div>
                        <img src={capnWarning} style={{ maxHeight: '30%', maxWidth: '30%', aspectRatio: 'auto' }} />
                    </div>
                        <div>
                            <Typography variant="h5" style={{ marginBottom: 5, textAlign: 'center' }}>
                                You have {isEligibleForFreeTip() ? 'not' : ''} used your free contract tip from me. {isEligibleForFreeTip() ? 'Do you want to use it for this player?' : ''}
                            </Typography> 
                            <Typography variant="h6" style={{ marginBottom: 5, textAlign: 'center' }}>
                                You can get unlimited contract tips from me by sending $3 to the commish!
                            </Typography>
                        </div>
                </DialogContent>
                <DialogActions>
                    <Button color='primary' onClick={() => setConfirmModal(false)} 
                    size='large' variant='contained'>Cancel</Button>
                    <LoadingButton loading={isLoading} disabled={!isEligibleForFreeTip()} 
                    color='success' style={{ marginLeft: 8 }} size='large' variant='contained' 
                    onClick={() => handleSubmission()}>Submit</LoadingButton>
                </DialogActions>
            </Dialog>
        </div>
    );
};