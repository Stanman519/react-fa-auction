import { Divider, Tooltip } from "@mui/material";

interface BidInfoProps{
    bidYears: number
    bidSalary: number
    highBidder: string
}

export const BidInfo = ({bidYears, bidSalary, highBidder }: BidInfoProps): JSX.Element => {
    return (
        <Tooltip title="Current highest bid" arrow placement='bottom'>
            <div style={{minHeight: 50, flexDirection: 'row', display: 'flex', alignItems: 'center', justifyContent: 'space-around', marginTop: 10}}>
                <div/>
                <h3 className="bid-info-text" >{highBidder}</h3>
                <Divider orientation="vertical" variant='middle' flexItem />
                <h3 className="bid-info-text">{bidYears} {bidYears === 1 ? 'year' : 'years'}</h3>
                <Divider orientation="vertical" variant='middle' flexItem />
                <h3 className="bid-info-text">${bidSalary}</h3>
                <div/>
            </div>
        </Tooltip>
    );
  }