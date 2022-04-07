import { Divider, Tooltip } from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import UIfx from 'uifx'
import { makeThisLotStale } from "../../redux/actions/LotActions";
import { RootState } from "../../store";


interface BidInfoProps {
    bidYears: number
    bidSalary: number
    highBidder: string
    lotId: number
    isFresh?: boolean
}

export const BidInfo = ({ bidYears, bidSalary, highBidder, isFresh, lotId }: BidInfoProps): JSX.Element => {
    const dispatch = useDispatch()
    const { audioOn } = useSelector((state: RootState) => state.ui);
    const notification = require('../../../assets/sounds/Blow.mp3');
    const beep = new UIfx(notification, { volume: 1 })
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
        <>
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
        </>
    );
};