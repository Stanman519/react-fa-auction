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
        let now = new Date(Date.now());

        //TODO: FIX THIS pass in UTC from parent?
        //i dont know why but for whatever reason i have to reconvert the expiration back into UTC... 
        //let utcExpiration = new Date(endTime.getFullYear(), endTime.getUTCMonth(), endTime.getUTCDate(),
        //endTime.getUTCHours(), endTime.getUTCMinutes(), endTime.getUTCSeconds(), 10);
        
        let utcDate = new Date(
            now.getFullYear(), now.getUTCMonth(), now.getUTCDate(),
            now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());

        let difference = +endTime - +utcDate;

        if (difference <= 0) {
            // NEED TO RESET THE CLOCK SO IT DOESN'T CALL API MULTIPLE TIMES
            setPreventClockTick(true)
            if(lot.bid) {
                dispatch(submitWin(lot.bid))
            }
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
                <div className="text-xl text-center w-full">{remaining.hours.toString().padStart(2, '0')}:{remaining.minutes.toString().padStart(2, '0')}:{remaining.seconds.toString().padStart(2, '0')} 
                </div>}
        </div>
    );
}