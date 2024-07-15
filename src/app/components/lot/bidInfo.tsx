import { Divider, Tooltip } from "@mui/material";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { makeThisLotStale } from "../../redux/actions/LotActions";
import { Lot } from "../../redux/reducers/LotReducer";
import "./styles/lot.css"
import { playNotificationSound } from "../../services/SoundUtils";
import React from "react";


interface BidInfoProps {
    lot: Lot
}



const BidInfo = React.memo(({ lot }: BidInfoProps): JSX.Element => {
    const dispatch = useDispatch()


    useEffect(() => {
        let timer: any
        if (lot?.isFresh) {
            playNotificationSound(); 
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
            <div className="flex flex-row items-center justify-around mt-2 mb-2">
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
        </div>
    );
});

export default BidInfo