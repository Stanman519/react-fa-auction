// import '../../styles/CapDetails.css';
// import '../../styles/DeadCapTable.css';
import { Card, CardContent } from '@mui/material';
import DeadCapTable from './DeadCapTable';
import { TeamCapDetails } from './TeamCapDetails';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

export default function DeadCapParentCard() {
    const [height, setHeight] = useState(0)
    const teamSelected = useSelector((state: RootState) => state.deadCap.selectedTeam !== undefined)
    return (
        <Card className="p-0" >
            <CardContent className="flex flex-col lg:flex-row lg:flex-1 p-0 flex-wrap">
                <div className="sm:flex-1 lg:w-8/12" style={{  }}>
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
    );

}




