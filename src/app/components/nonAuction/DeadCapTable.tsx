import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/reducers/RootReducer.js';
import { lastYear } from '../../services/Common';
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, CircularProgress, Card, CardContent } from '@mui/material';
import { selectTeam } from '../../redux/actions/DeadCapActions';
import { DeadCapInfo } from '../../redux/reducers/TransactionReducer';

export default function LeagueCapDetails({ retHeight }: { retHeight: (h: number) => void }) {
    const { selectedTeam, deadCap } = useSelector((state: RootState) => state.deadCap);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const ref = useRef<HTMLDivElement>(null)
    const dispatch = useDispatch();
    
    const getFixedCap = () => {
        let newList: DeadCapInfo[] = []
        deadCap.forEach(d => {
            if (newList.find(e => e.franchiseId === d.franchiseId) && (Object.keys(d.amount) as Array<string>).every(k => d.amount[k] === 0)) {

            } else {
                newList.push(d)
            }
        })
        return newList
    }
    const fixedDeadCap = getFixedCap()

    const getYearRange = () => {
        if (!deadCap) return
        const shortRange = deadCap
            .flatMap(d => {
                let filteredTotals = Object.keys(d.amount).filter(key => d.amount[key] !== 0)
                return filteredTotals
            })
            .filter((value, index, array) => array.indexOf(value) === index)
            .filter(v => Number(v) >= lastYear + 1)

        return shortRange//shortRange.length < 4 ? shortRange.concat((Number(shortRange[shortRange.length - 1]) + 1).toString()) : shortRange;
    }

    const YEAR_RANGE = getYearRange()

    const handleClick = (cap: DeadCapInfo) => {
        if (cap) dispatch(selectTeam(cap.franchiseId));
    }

    useEffect(() => {
        retHeight(ref.current?.clientHeight ?? 0)
    },[ref.current?.clientHeight])

    useEffect(() => {
        if (deadCap && deadCap.length > 0) setIsLoading(false)
    }, [deadCap]);


    return (
            <Card ref={ref} className="flex m-0 justify-center">
                <CardContent className="flex flex-col md:flex-1 m-0">
                    <div className="text-xl text-center"> Dead Cap Tracker </div>
                    {!isLoading ?
                        <div >
                            <TableContainer   className="" >
                                <Table size="small"  className="">
                                    <TableHead>
                                        <TableRow className="md:text-lg font-extrabold">
                                            <TableCell className="">Team</TableCell>
                                            <TableCell className="">Cap</TableCell>
                                            {YEAR_RANGE?.map(y => <TableCell className="" key={y}>{y}</TableCell>)}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody className="">
                                        {fixedDeadCap.map((row) => (
                                            <TableRow
                                                hover

                                                onClick={() => handleClick(row)}
                                                style={{ backgroundColor: selectedTeam === row?.franchiseId ? 'lightgray' : 'white', cursor: 'pointer' }}
                                                key={row.franchiseId}>
                                                <TableCell>{row.team}</TableCell>
                                                <TableCell style={{ color: (row.capRoom ?? 0) >= 0 ? 'green' : 'red' }}>${row.capRoom ?? 0}</TableCell>
                                                {YEAR_RANGE?.map(yr => {
                                                    return (<TableCell  key={yr}>${row.amount[yr.toString()] ?? 0}</TableCell>)
                                                }
                                                )}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <div className="flex justify-end flex-1" >
                                <div style={{ fontStyle: 'italic', fontSize: 12 }}>* Negative dead cap is extra money (good)</div>
                            </div>
                        </div>
                        :
                        <CircularProgress />
                    }
                </CardContent>
            </Card>
    );

}