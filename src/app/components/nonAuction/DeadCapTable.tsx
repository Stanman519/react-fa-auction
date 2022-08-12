import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import '../../styles/CapDetails.css';
import { RootState } from '../../redux/reducers/RootReducer.js';
import { lastYear } from '../../services/Common';
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, CircularProgress } from '@mui/material';
import { selectTeam } from '../../redux/actions/DeadCapActions';
import { DeadCapInfo } from '../../redux/reducers/TransactionReducer';




export default function CapDetails() {
    const { deadCap } = useSelector((state: RootState) => state);
    const { selectedTeam } = useSelector((state: RootState) => state.franchises);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const dispatch = useDispatch();
    const YEAR_RANGE = (): number[] => {
        let x = []
        for (let i = lastYear + 1; i < lastYear + 6; i++){
            x.push(i)
        }
        return x
    }
    const handleClick = (cap: DeadCapInfo) => {
        dispatch(selectTeam(cap.franchiseId));
    }


    useEffect(() => {
        if (deadCap.deadCap.length > 0) setIsLoading(false)
    }, [deadCap]);


        return (
         !isLoading ?
            <div>
                <h1 className="title"> Dead Cap Tracker </h1>
                <TableContainer className="scroll" >
                    <Table size="small" className="table">
                        <TableHead>
                            <TableRow className="table-text" style={{ paddingBottom: 200 }}>
                                <TableCell className="table-text">Team</TableCell>
                                {YEAR_RANGE().map(y => {
                                    <TableCell className="table-text">{y}</TableCell>
                                })}
                            </TableRow>
                        </TableHead>
                        <TableBody className="">
                            { deadCap.deadCap.map((row) => (
                                <TableRow onClick={() => handleClick(row)}
                                    style={{ backgroundColor: selectedTeam?.teamname === row?.team ? '#420E97' : '#283142' }}
                                    key={row.franchiseId}>
                                    <TableCell className="table-text first">{row.team}</TableCell>
                                    {YEAR_RANGE().map(yr => {
                                        <TableCell>{row.amount.get(yr.toString()) ?? 0}</TableCell>
                                    })}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>

            :

            <div>
                <h1 className="title"> Dead Cap Tracker </h1>
                <div>
                    <CircularProgress/> 
                </div>
            </div>
    );

}