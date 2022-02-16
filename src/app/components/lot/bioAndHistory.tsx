
import { ListItem, ListItemAvatar, Avatar, ListItemText, List, Button, ButtonGroup, Drawer, Container, Typography, TableCell, Table, TableBody, TableContainer, TableHead, TableRow, Card, CardMedia, CardContent, useTheme, Divider } from "@mui/material";
import { useState } from "react";
import { PlayerBio } from "../../redux/reducers/FreeAgentReducer";
import { Bid } from "../../redux/reducers/LotReducer";
import AuctionApiSvc from "../../services/AuctionApiSvc";
import { lastYear } from "../../services/Common";


export const BioAndHistory = ({ bid, screenWidth }: { bid: Bid, screenWidth: number }): JSX.Element => {
    const [showHistory, setShowHistory] = useState<boolean>(false);
    const [bidHistory, setBidHistory] = useState<Bid[]>([]);
    const [showBio, setShowBio] = useState<boolean>(false);
    const [bio, setBio] = useState<PlayerBio>();
    const lastYr: number = lastYear
    const theme = useTheme()
    const slabWidthMultiplier = screenWidth < 800 ? 0.6 : 0.4;

    const loadHistory = async () => {
        if (!bidHistory) {
            const historyRes: Bid[] = []//api call 
            setBidHistory(historyRes);
            return;
        }
        setShowHistory(true);
    }
    const loadBio = async () => {
        if (!bio) {
            const bioRes: PlayerBio = await AuctionApiSvc.getFullPlayerBio(lastYr, bid.player.mflId, bid.player.position, bid.player.firstName, bid.player.lastName);
            setBio(bioRes);
        }
        setShowBio(true);
    }

    return (
        <>
            <div style={{ display: 'flex', width: '100%' }}>

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

                    sx={{backgroundColor: 'transparent'}}
                    open={showBio}
                    variant="temporary"
                    anchor="right"
                    onClose={() => setShowBio(!showBio)}
                >
                    <Container style={{ backgroundColor: theme.extras.slabBackground, width: screenWidth * slabWidthMultiplier, maxWidth: 600, flexDirection: 'column', flex: 1 }}>
                        <Card sx={{marginTop: '20px' }}>
                            <CardMedia component='img' image={bio?.actionShot} />

                            {bio &&
                                <CardContent>
                                    <List>
                                        <ListItem>
                                            <ListItemText>
                                                <Typography variant="h3">{bio?.firstName.toUpperCase()} {bio?.lastName.toUpperCase()}</Typography>
                                            </ListItemText>
                                        </ListItem>
                                        <ListItem >
                                            <ListItemText>
                                                <Typography variant="h4">{bio?.position}, {bio?.team}</Typography>
                                            </ListItemText>
                                        </ListItem>
                                        <ListItem style={{display: 'flex', flexDirection: 'row', flexWrap: "wrap"}}>
                                            <ListItemText>
                                                <Typography variant="h4">{Math.floor(bio?.height / 12)}'{Math.floor(bio?.height % 12)}"</Typography>
                                            </ListItemText>
                                            <ListItemText>
                                                <Typography variant="h4">{bio?.weight} lbs </Typography>
                                            </ListItemText>
                                            <ListItemText>
                                                <Typography variant="h4">Age: {bio.age}</Typography>
                                            </ListItemText>
                                        </ListItem>
                                        <ListItem>
                                            <ListItemText secondary={`Rd. ${bio?.draftRound} Pk. ${bio?.draftPick} (${bio?.college})`}>
                                                <Typography variant="h4">Drafted: {bio?.draftYear}</Typography>
                                            </ListItemText>
                                        </ListItem>
                                        {bio?.lastSeasonSalary && bio?.lastSeasonSalary > 0 && <ListItem>
                                            <ListItemText secondary={`(${bio?.prevOwner})`}>
                                                <Typography variant="h4">2021 Salary: ${bio?.lastSeasonSalary}</Typography>
                                            </ListItemText>
                                        </ListItem>}
                                    </List>
                                </CardContent>}
                        </Card>
                        {bio?.positionRanks.some(yr => yr.points > 0) &&
                            <Card sx={{bgcolor: theme.palette.background.paper, marginTop: '20px', marginBottom: '20px'}}>
                                <CardContent style={{padding: 8}}>
                                    <TableContainer >
                                        <Table size="small">
                                            <TableHead >
                                                <TableRow >
                                                    <TableCell></TableCell>
                                                    <TableCell style={{fontWeight: 'bold'}} align="right">PTS</TableCell>
                                                    <TableCell style={{fontWeight: 'bold'}} align="right">POS RNK</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {bio?.positionRanks.map((row) =>
                                                    <TableRow key={row.year}>
                                                        <TableCell style={{fontWeight: 'bold', marginRight: 0}} align="left">{row.year}</TableCell>
                                                        <TableCell align="right">{Math.floor(row.points)}</TableCell>
                                                        <TableCell align="right">{row.rank}</TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>
                        }
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

