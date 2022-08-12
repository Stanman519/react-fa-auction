import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import '../styles/CapDetails.css';
import { RootState } from '../../redux/reducers/RootReducer.js';
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, CircularProgress } from '@mui/material';
import { loadTransactions } from '../../redux/actions/TransactionActions';



export const CapDetails = () => {
    const { selectedTeam, franchises } = useSelector((state: RootState) => state.franchises);
    const { transactions } = useSelector((state: RootState) => state);
    const FINAL_RELEVANT_YEAR = new Date().getFullYear() + 5
    const YEAR_RANGE = (): number[] => {
        let x = []
        for (let i = 2020; i < FINAL_RELEVANT_YEAR; i++){
            x.push(i)
        }
        return x
    }
    const filterPlayersForYear = (year: number) => {
        if (!selectedTeam) return [];
        return transactions.filter(t =>
            t.franchiseId === selectedTeam.franchiseId && t.yearOfTransaction <= year &&
            (t.yearOfTransaction + t.years) > year)
    }

    useEffect(() => {

    }, []);
    return (
        <div className="component">
            <p className="details-title"> {selectedTeam?.teamname}'s Penalties </p>
            <TableContainer className="details-table">
                <Table>
                        { YEAR_RANGE().map(y => {
                            return (
                            <>
                                <TableHead>
                                    <TableRow className="horizontal-year">
                                        <TableCell></TableCell>
                                        <TableCell className="year">{y}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filterPlayersForYear(y).map(t => (
                                        <TableRow key={t.transactionId}>
                                            <TableCell className="player-penalty-text">{t.playerName}</TableCell>
                                            <TableCell className="player-penalty-text">${t.amount}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </>
                            )
                        })
                        }
                </Table>
            </TableContainer>
        </div>
    );
} 

