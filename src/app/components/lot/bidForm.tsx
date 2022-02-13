import { Backdrop, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Modal, Slide, TextField, Typography, useTheme } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { forwardRef, useState } from "react";
import { useSelector } from "react-redux";
import { Lot } from "../../redux/reducers/LotReducer";
import { RootState } from "../../redux/reducers/RootReducer";


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
    const [bidSalary, setBidSalary] = useState<number>();
    const [bidLength, setBidLength] = useState<number>();
    const [confirmModal, setConfirmModal] = useState<boolean>(false);
    const theme = useTheme();
    const handleSubmission = async () => {
        setConfirmModal(false);
    }
    const style = {

    };

    return (

        <div>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                <TextField value={bidLength}
                    onChange={b => setBidLength(Number.parseInt(b.target.value))}
                    style={{ flex: 1, marginLeft: 10, marginRight: 10 }}
                    className='number-input' label='Years' type='number' InputProps={{ inputProps: { min: 0, max: 5 } }} />
                <TextField value={bidSalary}
                    onChange={b => setBidSalary(Number.parseInt(b.target.value))}
                    style={{ flex: 1, marginLeft: 10, marginRight: 10 }}
                    className='number-input' label='Salary' type='number' InputProps={{ inputProps: { min: 0, max: 500 } }} />
                <Button
                    onClick={() => setConfirmModal(true)}
                    style={{ flex: 1, marginLeft: 10, marginRight: 10 }} size='large' variant='contained'>
                    <h3 style={{ margin: 0 }}>{bidMode ? 'BID' : 'NOMINATE'}</h3>
                </Button>
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
                        {bidMode ? `bid on {lot.bid?.player?.firstName} {lot.bid?.player?.lastName}`
                            : `nominate lot.selectedPlayer.firstName} lot.selectedPlayer.lastName}`}
                        at ${bidSalary} for {bidLength} years?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button color='warning' onClick={() => setConfirmModal(false)} size='large' variant='contained'>Cancel</Button>
                    <Button style={{ marginLeft: 8 }} size='large' variant='contained'>Submit</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}