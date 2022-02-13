import { ListItem, ListItemAvatar, Avatar, ListItemText, List, Button, ButtonGroup, Drawer, Container, Typography, TableCell, Table, TableBody, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import { useEffect, useState } from "react";
import { PlayerBio } from "../redux/reducers/FreeAgentReducer";
import Bid from "../redux/reducers/LotReducer";
import AuctionApiSvc from "../services/AuctionApiSvc";
import { lastYear } from "../services/Common";


export const BioAndHistory = ({bid, screenWidth}: {bid: Bid, screenWidth: number}): JSX.Element => {
    const [showHistory, setShowHistory] = useState<boolean>(false);
    const [bidHistory, setBidHistory] = useState<Bid[]>([]);
    const [showBio, setShowBio] = useState<boolean>(false);
    const [bio, setBio] = useState<PlayerBio>();
    const lastYr: number = lastYear
    // MAKE function for API CALL on history click.  save to state if they click again
    const loadHistory = async () => {
        if (!bidHistory) {
            const historyRes: Bid[] = []//api call 
            setBidHistory(historyRes);
            return;
        }
        setShowHistory(true);
    }
    const loadBio = async () => {
        console.log(bio)
        if (!bio) {
            const bioRes: PlayerBio = await AuctionApiSvc.getFullPlayerBio(lastYr, bid.player.mflId, bid.player.position, bid.player.firstName, bid.player.lastName);
            setBio(bioRes);
        }
        setShowBio(true);
    }
    console.log('width', screenWidth)
    console.log('x4', screenWidth * .4)




    return (
        <>
        <div  style={{ display: 'flex', width: '100%' }}>
            
            <Drawer
                open={showHistory}
                variant="temporary"
                anchor="right"
                onClose={() => setShowHistory(!showHistory)}
            >
                <Container>
                    <List dense>
                        {[0, 1, 2].map(p =>
                            <ListItem>
                                <ListItemAvatar>
                                    <Avatar />
                                </ListItemAvatar>
                                <ListItemText
                                    primary="Single-line item"
                                    secondary={'Secondary text'}
                                />
                            </ListItem>)}
                    </List>
                </Container>
            </Drawer>

            <Drawer
                sx={{}}
                open={showBio}
                variant="temporary"
                anchor="right"
                onClose={() => setShowBio(!showBio)}
            >
                <Container sx={{display:'flex', width: screenWidth * .35, flexDirection: 'column', padding: 10}}>
                    <img style={{ }} src={bio?.actionShot}/> 
                    {/* <List dense={dense}></List> */}
                    <Typography variant={'h2'}>{bio?.firstName} {bio?.lastName}</Typography>
                    <Typography variant={'h3'}>{bio?.position}, {bio?.team}</Typography>
                    //@ts-ignore
                    <Typography variant={'h3'}>{Math.floor(bio?.height / 12)}'{Math.floor(bio?.height % 12)}", {bio?.weight} lbs</Typography>
                    <Typography variant={'h3'}>{bio?.draftYear} {bio?.draftRound}.{bio?.draftPick}</Typography>
                    <Typography variant={'h3'}>{bio?.college}</Typography>
                    {bio?.lastSeasonSalary && bio?.lastSeasonSalary > 0 && 
                    <Typography variant={'h4'}>Last Year: ${bio?.lastSeasonSalary} ({bio?.prevOwner})</Typography>}
                    {bio?.positionRanks.some(yr => yr.points > 0) &&                     
                    <TableContainer>
                        <Table size="small" >
                            <TableHead>
                                <TableRow>
                                    <TableCell></TableCell>
                                    <TableCell>Pts</TableCell>
                                    <TableCell>Pos Rank</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {bio?.positionRanks.map((row) => 
                                    <TableRow>
                                        <TableCell>{row.year}</TableCell>
                                        <TableCell>{row.points}</TableCell>
                                        <TableCell>{row.rank}</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>}
                </Container>
            </Drawer>

            <ButtonGroup sx={{ display: 'flex', width: '100%' }} aria-label="small button group">
                <Button sx={{ flex: 1 }} onClick={() => loadBio()}>Bio</Button>
                <Button sx={{ flex: 2 }} onClick={() => loadHistory()}>Bid History</Button>
            </ButtonGroup>

        </div>
        </>
    );
}

