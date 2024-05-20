import { Card, CardContent, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/reducers/RootReducer';
import { FranchiseStandings, SeasonFranchiseStanding } from '../../redux/reducers/TransactionReducer';
import { lastYear } from '../../services/Common';

export default function TriTable() {
    const ownerList = useSelector((state: RootState) => state.deadCap.deadCap);
    const [standings, setStandings] = useState<FranchiseStandings[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [years, setYears] = useState<number[]>([])
    const thisYear = lastYear + 1;
    useEffect(() => {
        axios.get(`https://capncrunch-api.azurewebsites.net/Mfl/standings/${thisYear}`)
            .then(res => {
                let sorted = res.data.sort((a: FranchiseStandings, b: FranchiseStandings) => (a.teamStandings.reduce((sum, ts) => (sum + ts.pointsFor) + (ts.h2hWins * 10), 0)) > (b.teamStandings.reduce((sum, ts) => (sum + ts.pointsFor) + (ts.h2hWins * 10), 0)) ? -1 : 1);
                setStandings(sorted)

                setYears(res.data.length > 0 ? 
                res.data[0].teamStandings.map((t: SeasonFranchiseStanding) => t.year)
                : [])
                if (res.status <= 300) setIsLoading(false)
            });
    }, []);
    return (
        <Card>
            <CardContent>
                {!isLoading ?
                    standings.some(s => s.teamStandings.some(t => t.pointsFor > 0))  ?
                    <>
                        <div className="title" style={{fontSize: 40}}>Tri-Year Trophy</div>
                        <div className="title">Presented By Taco Bell</div>
                        <TableContainer className="tri-scroll">
                            <Table size={'small'} >
                                <TableHead>
                                    <TableRow>
                                    <TableCell className="year-text"></TableCell>
                                        {years.map(y => <>

                                            <TableCell className="year-text"></TableCell>
                                            <TableCell className="year-text">{y}</TableCell>
                                            <TableCell/> 
                                        </>
                                        )}
                                    </TableRow>
                                    <TableRow className="horizontal">

                                        <TableCell></TableCell>
                                        {years.map(y => 
                                        <>
                                            <TableCell className="tritable-text">Wins</TableCell>
                                            <TableCell className="tritable-text">Pts For</TableCell>
                                            <TableCell className="tritable-text">TYT Pts</TableCell>
                                        </>
                                        )}

                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {standings.map((row) => (
                                        <TableRow className="horizontal" key={row.franchiseId}>
                                            <TableCell className="team-text">
                                                {ownerList.find(o => o.franchiseId === row.franchiseId)?.team}
                                                <div className="text-rose-800">{(row.teamStandings.reduce((sum, ts) => (sum + ts.pointsFor) + (ts.h2hWins * 10), 0)).toFixed(1)} Pts</div>

                                            </TableCell>
                                            {row.teamStandings.map((tm, i) => {
                                                return (
                                                    <>
                                                    <TableCell className="tritable-text">{tm.h2hWins ?? 0}</TableCell>
                                                    <TableCell className="tritable-text">{tm.pointsFor ?? 0}</TableCell>
                                                    <TableCell className="vertical tritable-text">{tm.h2hWins * 10 + tm.pointsFor}</TableCell>
                                                    </>
                                                )
                                            })}

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
    );
} 
