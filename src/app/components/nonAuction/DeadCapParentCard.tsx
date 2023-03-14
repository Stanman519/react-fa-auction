import '../../styles/CapDetails.css';
import '../../styles/DeadCapTable.css';
import { Card, CardContent } from '@mui/material';
import DeadCapTable from './DeadCapTable';
import { TeamCapDetails } from './TeamCapDetails';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

export default function DeadCapParentCard() {
    const [height, setHeight] = useState(0)
    const teamSelected = useSelector((state: RootState) => state.deadCap.selectedTeam != undefined)
    return (
        <Card className="card-container" style={{ margin: 16, flex: 1, }}>
            <CardContent style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', margin: 16 }}>
                <div style={{ flex: 10 }}>
                    <DeadCapTable height={(h) => setHeight(h)} />
                </div>
                {teamSelected &&
                    <>
                        <div style={{ flex: 1 }} />
                        <div style={{ flex: 5 }}>
                            <TeamCapDetails height={height} />
                        </div>
                    </>
                }
            </CardContent>
        </Card>
    );

}




