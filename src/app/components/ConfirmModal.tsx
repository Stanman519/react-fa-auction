import { LoadingButton } from "@mui/lab";
import { Backdrop, Button, Dialog, DialogActions, DialogContent, Slide, Typography } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { forwardRef } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../hooks";
import { updateUI } from "../redux/actions/UiActions";
import { RootState } from "../store";

interface ConfirmModalProps{
    isOpen: boolean
    actionButtonLabel: string
    mainText: string
    onAction: () => void
}

export const ConfirmModal = ({isOpen = false, onAction, actionButtonLabel, mainText}: ConfirmModalProps): JSX.Element => {
    const capnWarning = process.env.PUBLIC_URL + '/capn-wtf.png';
    const { isLoading } = useSelector((state: RootState) => state.ui)
    const dispatch = useAppDispatch();
    const Transition = forwardRef(function Transition(
        props: TransitionProps & {
            children: React.ReactElement<any, any>;
        },
        ref: React.Ref<unknown>,
    ) {
        return <Slide direction="up" ref={ref} {...props} />;
    });
    return (
        <div>
            <Backdrop
                sx={{ color: '#fff', backdropFilter: 'blur(3px)', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={isOpen}
            />
            <Dialog
                open={isOpen}
                TransitionComponent={Transition}
                keepMounted
            >
                <DialogContent style={{ paddingTop: 10 }}>
                    <div>
                        <img src={capnWarning} style={{ maxHeight: '30%', maxWidth: '30%', aspectRatio: 'auto' }} />
                    </div>
                    <Typography variant="h5" style={{ marginBottom: 5, textAlign: 'center' }}>
                        {mainText}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button color='primary' onClick={() => dispatch(updateUI({modal: undefined}))} size='large' variant='contained'>Cancel</Button>
                    <LoadingButton loading={isLoading === 'button'} color='success' style={{ marginLeft: 8 }} size='large' variant='contained' onClick={() => onAction()}>{actionButtonLabel}</LoadingButton>
                </DialogActions>
            </Dialog>
        </div>
    );
}