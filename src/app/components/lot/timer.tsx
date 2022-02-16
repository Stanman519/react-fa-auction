import { useEffect, useState } from "react";
import { ownerMap } from "../../services/Common";



export const Timer = ({ endTime, lotId }: { endTime?: Date, lotId: number }): JSX.Element => {

    const calculateTimeLeft = (endTime: Date | undefined) => {
        if (!endTime) return
        let now = new Date(Date.now());
        let utcDate = new Date(
            now.getFullYear(), now.getUTCMonth(), now.getUTCDate(),
            now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), 10);
        let difference = +endTime - +utcDate;

        if (difference < 0) {
            // DO STUFF
        }

        let timeLeft = {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60)
        };
        return timeLeft;
    }

    const [remaining, setRemaining] = useState(calculateTimeLeft(endTime));
    const ownername = ownerMap.find(o => o.id === lotId)?.name ?? '';
    const getTimerColor = (): string => {
        if (!endTime || !remaining) return 'linear-gradient(90deg, rgba(192,192,192,0) 0%, rgba(192,192,192.73) 50%, rgba(192,192,192,0) 100%)'
        if (remaining.hours < 1) return 'linear-gradient(90deg, rgba(255,0,0,0) 0%, rgba(255,0,0,0.73) 50%, rgba(255,0,0,0) 100%)'
        if (remaining.hours < 3) return 'linear-gradient(90deg, rgba(255,153,0,0) 0%, rgba(255,153,0,0.73) 50%, rgba(255,153,0,0) 100%)'
        if (remaining.hours < 6) return 'linear-gradient(90deg, rgba(255,255,51,0) 0%, rgba(255,255,51,0.73) 50%, rgba(255,255,51,0) 100%)'
        else return 'linear-gradient(90deg, rgba(51,204,0,0) 0%, rgba(51,204,0,0.73) 50%, rgba(51,204,0,0) 100%)'
    }
    useEffect(() => {
        const timer = setTimeout(() => {
            if (endTime) setRemaining(calculateTimeLeft(endTime));
        }, 100);
    });

    return (
        <div style={{ background: getTimerColor(), marginBottom: 5 }}>
            {endTime && remaining && 
                <h2 className='timer-text'>{remaining.hours.toString().padStart(2, '0')}:{remaining.minutes.toString().padStart(2, '0')}:{remaining.seconds.toString().padStart(2, '0')} 
                </h2>}
        </div>
    );
}