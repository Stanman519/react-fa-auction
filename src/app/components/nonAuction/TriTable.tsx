import { Card, CardContent, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/reducers/RootReducer';
import { Standings } from '../../redux/reducers/TransactionReducer';
import { lastYear } from '../../services/Common';
import '../../styles/TriTable.css';

export default function TriTable() {
    const ownerList = useSelector((state: RootState) => state.deadCap.deadCap);
    console.log('ownerList', ownerList)
    const [standings, setStandings] = useState<Standings[]>([]);
    console.log('standings', standings)
    const [isLoading, setIsLoading] = useState(true);
    const relevantYears = [2020, 2021, 2022];
    const thisYear = lastYear + 1;
    useEffect(() => {
        axios.get(`https://capncrunch-api.azurewebsites.net/Mfl/standings/${thisYear}`)
            .then(res => {
                let sorted = res.data.sort((a: any, b: any) => ((a.h2hWins1 * 5 + a.pointsFor1) + (a.h2hWins2 * 5 + a.pointsFor2) + (a.h2hWins3 * 5 + a.pointsFor3)) > ((b.h2hWins1 * 5 + b.pointsFor1) + (b.h2hWins2 * 5 + b.pointsFor2) + (b.h2hWins3 * 5 + b.pointsFor3)) ? -1 : 1);
                setStandings(sorted)
                setIsLoading(false)
            });
    }, []);
    return (
        <div>
        <Card>
            <CardContent>
                {!isLoading ?
                    standings.some(s => s.pointsFor1 > 0) ?
                    <>
                        <div className="title" style={{fontSize: 50}}>Tri-Year Trophy</div>
                        <div className="title">Presented By Taco Bell</div>
                        <TableContainer className="tri-scroll">
                            <Table >

                                <TableHead>
                                    <TableRow>
                                        {relevantYears.map(y => <>
                                            <TableCell className="year-text"></TableCell>
                                            <TableCell className="year-text"></TableCell>
                                            <TableCell className="year-text">{y}</TableCell>
                                        </>
                                        )}
                                    </TableRow>
                                    <TableRow className="horizontal">
                                        <TableCell></TableCell>
                                        <TableCell className="tritable-text">Wins</TableCell>
                                        <TableCell className="tritable-text">Pts For</TableCell>
                                        <TableCell className="tritable-text">TYT Pts</TableCell>
                                        <TableCell className="tritable-text">Wins</TableCell>
                                        <TableCell className="tritable-text">Pts For</TableCell>
                                        <TableCell className="tritable-text">TYT Pts</TableCell>
                                        <TableCell className="tritable-text">Wins</TableCell>
                                        <TableCell className="tritable-text">Pts For</TableCell>
                                        <TableCell className="tritable-text">TYT Pts</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {standings.map((row) => (
                                        <TableRow className="horizontal" key={row.franchiseId}>
                                            <TableCell className="team-text">
                                                {ownerList.find(o => o.franchiseId === row.franchiseId)?.team}
                                                <div className="total">{((row.h2hWins1 * 5 + row.pointsFor1) + (row.h2hWins2 * 5 + row.pointsFor2)
                                                    + (row.h2hWins3 * 5 + row.pointsFor3)).toFixed(1)} PTS</div>

                                            </TableCell>
                                            <TableCell className="tritable-text">{row.h2hWins1 ?? 0}</TableCell>
                                            <TableCell className="tritable-text">{row.pointsFor1 ?? 0}</TableCell>
                                            <TableCell className="vertical tritable-text">{row.h2hWins1 * 5 + row.pointsFor1}</TableCell>
                                            <TableCell className="tritable-text">{row.h2hWins2 ?? 0}</TableCell>
                                            <TableCell className="tritable-text">{row.pointsFor2 ?? 0}</TableCell>
                                            <TableCell className="vertical tritable-text">{row.h2hWins2 * 5 + row.pointsFor2}</TableCell>
                                            <TableCell className="tritable-text">{row.h2hWins3 ?? 0}</TableCell>
                                            <TableCell className="tritable-text">{row.pointsFor3 ?? 0}</TableCell>
                                            <TableCell className="tritable-text">{row.h2hWins3 * 5 + row.pointsFor3}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </> :
                    <div className="text-center">Tri-Year Trophy <span style={{fontSize: 10}}>presented by Taco Bell</span> standings will appear when the next cycle begins</div>
                    :
                    <CircularProgress />
                }

            </CardContent>
        </Card>
        </div>
    );
} 
