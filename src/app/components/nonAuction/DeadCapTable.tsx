import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import '../../styles/CapDetails.css';
import '../../styles/DeadCapTable.css';
import { RootState } from '../../redux/reducers/RootReducer.js';
import { lastYear } from '../../services/Common';
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, CircularProgress, Card, CardContent } from '@mui/material';
import { selectTeam } from '../../redux/actions/DeadCapActions';
import { DeadCapInfo } from '../../redux/reducers/TransactionReducer';

export default function LeagueCapDetails({height}: {height: (h: number) => void}) {
    const { deadCap } = useSelector((state: RootState) => state);
    const { selectedTeam } = useSelector((state: RootState) => state.deadCap);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [returnHeight, setReturnHeight] = useState<number>(0)
    const ref = useRef<HTMLDivElement>(null)
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
        console.log('height',ref.current?.clientHeight)
        height(ref.current?.clientHeight ?? 0)
    },[ref.current?.clientHeight])

    useEffect(() => {
        if (deadCap.deadCap.length > 0) setIsLoading(false)
    }, [deadCap]);


    return (
        <div >
                <Card ref={ref}  className="card-container">
                    <CardContent>
                    <h1 className="title"> Dead Cap Tracker </h1>
                        {!isLoading ? 
                        <div>
                        <TableContainer className="scroll" >
                            <Table size="small" className="table">
                                <TableHead>
                                    <TableRow >
                                        <TableCell >Team</TableCell>
                                        {YEAR_RANGE().map(y => <TableCell key={y}>{y}</TableCell>)}
                                    </TableRow>
                                </TableHead>
                                <TableBody className="">
                                    {deadCap.deadCap.map((row) => (
                                        <TableRow
                                            hover

                                            onClick={() => handleClick(row)}
                                            style={{ backgroundColor: selectedTeam == row?.franchiseId ? 'lightgray' : 'white', cursor: 'pointer' }}
                                            key={row.franchiseId}>
                                            <TableCell>{row.team}</TableCell>
                                            {YEAR_RANGE().map(yr => {
                                                return (<TableCell key={yr}>${row.amount[yr.toString()] ?? 0}</TableCell>)
                                            }
                                            )}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                            <div style={{display: 'flex', justifyContent: 'flex-end', flex: 1}}>
                                <div style={{fontStyle:'italic', fontSize: 12}}>* Negative dead cap is extra money (good)</div>
                            </div>
                            </div>
                        :
                        <CircularProgress />
                        }
                    </CardContent>
                </Card>
                </div>
    );

}