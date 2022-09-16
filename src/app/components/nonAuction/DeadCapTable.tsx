import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import '../../styles/CapDetails.css';
import { RootState } from '../../redux/reducers/RootReducer.js';
import { lastYear } from '../../services/Common';
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, CircularProgress, Card, CardContent } from '@mui/material';
import { selectTeam } from '../../redux/actions/DeadCapActions';
import { DeadCapInfo } from '../../redux/reducers/TransactionReducer';

export default function CapDetails() {
    const { deadCap } = useSelector((state: RootState) => state);
    const { selectedTeam } = useSelector((state: RootState) => state.deadCap);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const dispatch = useDispatch();
    const YEAR_RANGE = (): number[] => {
        let x = []
        for (let i = lastYear + 1; i < lastYear + 6; i++) {
            x.push(i)
        }
        return x
    }
    const handleClick = (cap: DeadCapInfo) => {
        if (cap) dispatch(selectTeam(cap.franchiseId));
    }


    useEffect(() => {
        if (deadCap.deadCap.length > 0) setIsLoading(false)
    }, [deadCap]);


    return (
            <div style={{margin: 10}}>
                <h1 className="title" style={{fontSize: 50, marginBottom: 10}}> Dead Cap Tracker </h1>
                <Card>
                    <CardContent>
                        {!isLoading ? 
                        <TableContainer className="scroll" >
                            <Table size="small" className="table">
                                <TableHead>
                                    <TableRow className="table-text" style={{ paddingBottom: 200 }}>
                                        <TableCell className="table-text">Team</TableCell>
                                        {YEAR_RANGE().map(y => <TableCell key={y} className="table-text">{y}</TableCell>)}
                                    </TableRow>
                                </TableHead>
                                <TableBody className="">
                                    {deadCap.deadCap.map((row) => (
                                        <TableRow
                                            hover

                                            onClick={() => handleClick(row)}
                                            style={{ backgroundColor: selectedTeam == row?.franchiseId ? 'gray' : 'white', cursor: 'pointer' }}
                                            key={row.franchiseId}>
                                            <TableCell className="table-text first">{row.team}</TableCell>
                                            {YEAR_RANGE().map(yr => {
                                                return (<TableCell key={yr}>${row.amount[yr.toString()] ?? 0}</TableCell>)
                                            }
                                            )}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        :
                        <CircularProgress />
                        }
                    </CardContent>
                </Card>
            </div>

    );

}