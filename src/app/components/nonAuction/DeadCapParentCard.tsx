import { Card, CardContent } from '@mui/material';
import DeadCapTable from './DeadCapTable';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { TeamCapDetails } from './TeamCapDetails';
import { getLeagueCapInfo } from '../../redux/actions/TransactionActions';

export default function DeadCapParentCard() {
    const [height, setHeight] = useState(0)
    const teamSelected = useSelector((state: RootState) => state.deadCap.selectedTeam !== undefined)
    const {deadCap} = useSelector((state: RootState) => state.deadCap)
    const dispatch = useDispatch()



    return (
        <div className="w-full">
            <Card className="p-0 w-full rounded-none" sx={{ borderTop: '3px solid', borderColor: 'primary.main' }}>
                <CardContent className="flex flex-col lg:flex-row p-0 flex-wrap">
                    <div className="lg:w-8/12" style={{  }}>
                        <DeadCapTable retHeight={(h) => setHeight(h)} />
                    </div>
                    {teamSelected &&
                    <div className="flex flex-col lg:flex-row lg:w-4/12">
                        <div className="flex-1 mt-2 lg:w-4/12 lg:ml-2 lg:mt-0" >
                            <TeamCapDetails height={height} />
                        </div>
                    </div>
                    }
                </CardContent>
            </Card>
        </div>
    );

}




