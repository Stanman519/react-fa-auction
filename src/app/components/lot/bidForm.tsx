import { Cancel } from "@mui/icons-material";
import { Backdrop, Button, Dialog, DialogActions, DialogContent, Slide, TextField, Tooltip, Typography, useTheme } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import LoadingButton from '@mui/lab/LoadingButton';
import { forwardRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { makeNewBid, makeNewNomination } from "../../redux/actions/LotActions";
import { Lot } from "../../redux/reducers/LotReducer";
import { RootState } from "../../redux/reducers/RootReducer";
import { checkValidity } from "../../services/Common";
import './styles/lot.scss';

const Transition = forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement<any, any>;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export const BidForm = ({ bidMode, lot }: { bidMode: boolean, lot: Lot }): JSX.Element => {
    const capnWarning = process.env.PUBLIC_URL + '/capn-wtf.png';
    const [bidSalary, setBidSalary] = useState<number>(0);
    const [bidLength, setBidLength] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>();
    const { profile } = useSelector((state: RootState) => state);
    const [confirmModal, setConfirmModal] = useState<boolean>(false);
    const theme = useTheme();
    const dispatch = useDispatch();
    
    const fauxButtonDisable = () => {
        if (getValidity().isValid) setConfirmModal(true)
    }
    const getValidity = () => checkValidity(profile, bidSalary ? bidSalary : 0, bidLength ? bidLength : 0,
        lot.bid?.player.mflId ?? "", lot.bid?.bidSalary ?? 0, lot.bid?.bidLength ?? 0);

    const handleSubmission = () => {
        if (bidMode && lot.bid) {
            setIsLoading(true);
            dispatch(makeNewBid({
                ownerId: profile.ownerId,
                ownername: profile.ownername,
                bidSalary: bidSalary ?? 0,
                bidLength: bidLength ?? 0,
                lotId: lot.lotId,
                player: { ...lot?.bid?.player }
            }))
            setBidLength(0);
            setBidSalary(0);
            setIsLoading(false);
        } else if (lot.bid) {
            setIsLoading(true);
            dispatch(makeNewNomination({
                ownerId: profile.ownerId,
                ownername: profile.ownername,
                bidSalary: bidSalary ?? 0,
                bidLength: bidLength ?? 0,
                lotId: lot.lotId,
                player: { ...lot?.bid?.player }
            }))
            setBidLength(0);
            setBidSalary(0);
            setIsLoading(false);
        }
        setConfirmModal(false);
    }


    return (

        <div style={{ marginTop: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                <TextField value={bidLength}
                    onChange={b => setBidLength(Number.parseInt(b.target.value))}
                    style={{ flex: 1, marginLeft: 10, marginRight: 10 }}
                    className='number-input'
                    label='Years' type='number' InputProps={{ inputProps: { min: 0, max: 5 } }} />
                <TextField value={bidSalary}
                    onChange={b => setBidSalary(Number.parseInt(b.target.value))}
                    style={{ flex: 1, marginLeft: 10, marginRight: 10 }}
                    className='number-input'
                    label='Salary' type='number' InputProps={{ inputProps: { min: 0, max: 500 } }} />
                <Tooltip 
                title={getValidity().violations.length > 0 ?
                    getValidity().violations.map(v =>
                        <div style={{ alignItems: 'center', display: 'flex' }} key={v}>
                            <Cancel fontSize={'small'} color={'warning'} /><span>{v}</span>
                        </div>) : ""} 
                arrow placement='bottom'>
                    <Button
                        onClick={() => fauxButtonDisable()}
                        disableRipple={!getValidity().isValid} // need to do this because tooltip won't work if disabled is a property
                        style={{ flex: 1, marginLeft: 10, marginRight: 10 }} size='large' variant='contained'>
                        <h3 style={{ margin: 0 }}>{bidMode ? 'BID' : 'NOMINATE'}</h3>
                    </Button>
                </Tooltip>
            </div>
            <Backdrop
                sx={{ color: '#fff', backdropFilter: 'blur(3px)', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={confirmModal}
            />
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
                        Are you sure you want to
                        {bidMode ? ` bid on ${lot.bid?.player?.firstName} ${lot.bid?.player?.lastName} `
                            : ` nominate ${lot.bid?.player?.firstName} ${lot.bid?.player?.lastName} `}
                        at ${bidSalary} for {bidLength} years?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button color='primary' onClick={() => setConfirmModal(false)} size='large' variant='contained'>Cancel</Button>
                    <LoadingButton loading={isLoading} color='success' style={{ marginLeft: 8 }} size='large' variant='contained' onClick={() => handleSubmission()}>Submit</LoadingButton>
                </DialogActions>
            </Dialog>
        </div>
    );
}