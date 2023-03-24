import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/reducers/RootReducer.js';
import { Accordion, AccordionDetails, AccordionSummary, Typography, Avatar, List, ListItemAvatar, ListItemText, Divider, Card, CardContent } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';



export const TeamCapDetails = ({height}: {height: number}) => {
    const { selectedTeam, deadCap } = useSelector((state: RootState) => state.deadCap);
    const { transactions } = useSelector((state: RootState) => state);
    const FINAL_RELEVANT_YEAR = new Date().getFullYear() + 5
    const YEAR_RANGE = (): number[] => {
        let x = []
        for (let i = 2020; i < FINAL_RELEVANT_YEAR; i++) {
            x.push(i)
        }
        return x
    }
    const filterPlayersForYear = (year: number) => {
        if (!selectedTeam) return [];
        return transactions.filter(t =>
            t.franchiseId === selectedTeam && t.yearOfTransaction <= year &&
            (t.yearOfTransaction + t.years) > year)
    }

    useEffect(() => {

    }, []);
    return (
        <Card className="flex flex-col" style={{maxHeight: height}} >
            <CardContent style={{overflowY: 'auto'}} >
                {selectedTeam ?
                    <div>
                        <Typography className="text-center" variant={'h6'}> {deadCap.find(t => t.franchiseId === selectedTeam)?.team}'s Cap Adjustments </Typography>
                        <div style={{overflow: 'auto'}}>
                            {YEAR_RANGE().map(y => {
                                let players = filterPlayersForYear(y)
                                if (players.length > 0) {
                                    return (
                                        <Accordion key={y}>
                                            <AccordionSummary
                                                expandIcon={<ExpandMoreIcon />}
                                                aria-controls="panel1a-content"
                                                id="panel1a-header"
                                            >
                                                <Typography>{y}</Typography>
                                            </AccordionSummary>
                                            <AccordionDetails>
                                                <List>
                                                    {players.map(t => (
                                                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }} key={`${t.transactionId}-${y}`}>
                                                            <ListItemAvatar>
                                                                <Avatar>{t.position}</Avatar>
                                                            </ListItemAvatar>
                                                            <ListItemText primary={t.playerName} secondary={`$${t.amount}`} style={{ textAlign: 'left' }} />
                                                            <Divider />
                                                        </div>
                                                    ))}
                                                </List>

                                            </AccordionDetails>
                                        </Accordion>)
                                }
                            })
                            }
                            
                        </div>
                    </div> :
                    <Typography variant={'h6'}> Select a team to view player details. </Typography>

                }
            </CardContent>
        </Card>
    );
}

