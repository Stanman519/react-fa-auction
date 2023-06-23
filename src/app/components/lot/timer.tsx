import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { submitWin } from "../../redux/actions/LotActions";
import { Lot } from "../../redux/reducers/LotReducer";
import { ownerMap } from "../../services/Common";

export interface ExpirationObj {
    days: number
    hours: number
    minutes: number
    seconds: number
}


export const Timer = ({ endTime, lot }: { endTime?: Date, lot: Lot }): JSX.Element => {
    const dispatch = useDispatch();
    const [remaining, setRemaining] = useState<ExpirationObj>();
    const [preventClockTick, setPreventClockTick] = useState<boolean>(false);
    const calculateTimeLeft = async (endTime: Date | undefined) => {
        if (!endTime) return
        let now = new Date(new Date(Date.now()).toUTCString());
        // 2023 edit! the end time doesnt need to be converted to UTC because it is in UTC in DB. just need NOW to be in UTC
        let utcDate = new Date(
            now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),
            now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());


        let difference = +endTime - +utcDate;

        if (difference <= 0) {
            // NEED TO RESET THE CLOCK SO IT DOESN'T CALL API MULTIPLE TIMES
            setPreventClockTick(true)
            if(lot.bid) {
                dispatch(submitWin(lot.bid))
            }
            return {
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0
            } as ExpirationObj;
        }

        let timeLeft: ExpirationObj = {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60) + 1
        };
        return timeLeft;
    }


    const getTimerColor = (): string => {
        if (!endTime || !remaining) return 'linear-gradient(90deg, rgba(192,192,192,0) 0%, rgba(192,192,192.73) 50%, rgba(192,192,192,0) 100%)'
        if (remaining.hours < 1) return 'linear-gradient(90deg, rgba(255,0,0,0) 0%, rgba(255,0,0,0.73) 50%, rgba(255,0,0,0) 100%)'
        if (remaining.hours < 3) return 'linear-gradient(90deg, rgba(255,153,0,0) 0%, rgba(255,153,0,0.73) 50%, rgba(255,153,0,0) 100%)'
        if (remaining.hours < 6) return 'linear-gradient(90deg, rgba(255,255,51,0) 0%, rgba(255,255,51,0.73) 50%, rgba(255,255,51,0) 100%)'
        else return 'linear-gradient(90deg, rgba(51,204,0,0) 0%, rgba(51,204,0,0.73) 50%, rgba(51,204,0,0) 100%)'
    }
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (endTime && !preventClockTick) setRemaining(await calculateTimeLeft(endTime));
        }, 1000);
    });

    return (
        <div className="mb-1 flex content-center" style={{ background: getTimerColor() }}>
            {endTime && remaining && 
                <div className="text-xl text-center w-full">{remaining.days}:{remaining.hours.toString().padStart(2, '0')}:{remaining.minutes.toString().padStart(2, '0')}:{remaining.seconds.toString().padStart(2, '0')} 
                </div>}
        </div>
    );
}