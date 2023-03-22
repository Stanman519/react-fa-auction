
import { ListItem, ListItemAvatar, Avatar, ListItemText, List, Button, ButtonGroup, Drawer, Container, Typography, TableCell, Table, TableBody, TableContainer, TableHead, TableRow, Card, CardMedia, CardContent, useTheme, Divider, Skeleton } from "@mui/material";
import { useState } from "react";
import { useSelector } from "react-redux";
import { PlayerBio } from "../../redux/reducers/FreeAgentReducer";
import { Bid } from "../../redux/reducers/LotReducer";
import AuctionApiSvc from "../../services/AuctionApiSvc";
import { getRankStringSuffix, lastYear, ownerMap, tmColorMap } from "../../services/Common";
import { RootState } from "../../store";


export const BioAndHistory = ({ bid}: { bid: Bid}): JSX.Element => {
    const [showHistory, setShowHistory] = useState<boolean>(false);
    const [bidHistory, setBidHistory] = useState<Bid[]>([]);
    const [showBio, setShowBio] = useState<boolean>(false);
    const [bio, setBio] = useState<PlayerBio>();
    const [isLoading, setIsLoading] = useState(false);
    const lastYr: number = lastYear
    const theme = useTheme()
    const slabWidthMultiplier = window.innerWidth < 720 ? 0.6 : 0.4;

    const getLocalBidTimeStamp = (expires: Date) => {
        let dayBefore = new Date(expires);
        dayBefore.setUTCDate(expires.getUTCDate() - 1)
        return `${dayBefore.toLocaleDateString()} ${dayBefore.toLocaleTimeString()} `
    }

    const loadHistory = async () => {
        if (bidHistory.length === 0) {
            const res = await AuctionApiSvc.getBidHistoryByPlayerId(bid.player.mflId);
            const historyRes = await AuctionApiSvc.handleErrorResponse(res) as Bid[];
            setBidHistory(historyRes);
        }
        setShowHistory(true);
    }
    const loadBio = async () => {
        if (!bio || !bid.expires || bid.player.mflId) {
            // NEED TO FIGURE OUT IF THIS IS A NEW NOM BECAUSE WE DON't hit this block
            setIsLoading(true)
            setShowBio(true)
            const hasAction: boolean = bid.player.actionShot ? true : false
            const res = await AuctionApiSvc.getFullPlayerBio(lastYr, bid.player.mflId, bid.player.position, bid.player.firstName, bid.player.lastName, hasAction);
            const bioRes = await AuctionApiSvc.handleErrorResponse(res) as PlayerBio;
            setBio({...bioRes, actionShot: hasAction ? bid.player.actionShot ?? '' : bioRes.actionShot});
            setIsLoading(false);
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
                            {bidHistory.map(p =>
                                <ListItem key={p.bidId}>
                                    <ListItemAvatar>
                                        <Avatar src={ownerMap.find(o => o.id=== p.ownerId)?.avatar ?? ''}/>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={`$${p.bidSalary}, ${p.bidLength} ${p.bidLength=== 1 ? 'year' : 'years'}`}
                                        secondary={`${getLocalBidTimeStamp(new Date(p.expires ?? ""))}`}
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
                    <Container style={{ backgroundColor: theme.palette.background.default, width: window.innerWidth * slabWidthMultiplier, maxWidth: 600, flexDirection: 'column', flex: 1 }}>
                        {showBio && !isLoading && bio ?
                        <Card sx={{marginTop: '20px' }}>
                            <CardMedia component='img' image={bio?.actionShot} />
                                <CardContent>
                                    <List>
                                        <ListItem>
                                            <ListItemText>
                                                <Typography variant="h3">{bio.firstName.toUpperCase()} {bio?.lastName.toUpperCase()}</Typography>
                                            </ListItemText>
                                        </ListItem>
                                        <Divider /> 
                                        <ListItem >
                                            <ListItemText>
                                                <Typography variant="h5"> {tmColorMap.find(tm => tm.team=== bio.team)?.nickname ?? "Free Agent"} {bio?.position}</Typography>
                                            </ListItemText>
                                        </ListItem>
                                        <Divider /> 
                                        <ListItem>
                                            <ListItemText>
                                                <Typography variant="h5">{Math.floor(bio?.height / 12)}'{Math.floor(bio?.height % 12)}"</Typography>
                                            </ListItemText>
                                        </ListItem>
                                        <ListItem>
                                            <ListItemText>
                                                <Typography variant="h5">{bio?.weight} lbs </Typography>
                                            </ListItemText>
                                        </ListItem>
                                        <ListItem>
                                            <ListItemText>
                                                <Typography variant="h5">Age: {bio.age}</Typography>
                                            </ListItemText>
                                        </ListItem>
                                        <Divider /> 
                                        <ListItem>
                                            <ListItemText secondary={bio?.draftRound ? `Rd. ${bio?.draftRound} Pk. ${bio?.draftPick} (${bio?.college})` : ''}>
                                                <Typography variant="h5">{bio?.draftRound ? `Drafted: ${bio?.draftYear}`: `${bio?.draftYear} undrafted`}</Typography>
                                            </ListItemText>
                                        </ListItem>
                                        <Divider />
                                        {bio?.lastSeasonSalary > 0 && 
                                        <ListItem>
                                            <ListItemText secondary={`(${bio?.prevOwner})`}>
                                                <Typography variant="h5">2021 Salary: ${bio?.lastSeasonSalary}</Typography>
                                            </ListItemText>
                                        </ListItem>}
                                    </List>
                                </CardContent> 
                        </Card>
                        : 
                        <>
                            <Skeleton variant="rectangular" height={window.innerWidth/2}/>
                            <Skeleton variant="text"/>
                            <Skeleton variant="text"/>
                            <Skeleton variant="text"/>
                            <Skeleton variant="text"/>
                        </> }
                        {bio?.positionRanks.some(yr => yr.points > 0) &&
                            <Card sx={{bgcolor: theme.palette.background.paper, marginTop: '20px', marginBottom: '20px'}}>
                                <CardContent style={{padding: 8}}>
                                    {showBio && !isLoading ? <TableContainer >
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
                                                        <TableCell align="right">{getRankStringSuffix(row.rank)}</TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer> :
                                    <Skeleton variant="rectangular" />
                                    }

                                </CardContent>
                            </Card>
                        }
                    </Container>
                </Drawer>

                <ButtonGroup sx={{ display: 'flex', width: '100%' }} aria-label="small button group">
                    <Button sx={{ flex: 1 }} onClick={() => loadBio()}>Bio</Button>
                    {bid?.expires && <Button sx={{ flex: 2, lineHeight: '14px' }} onClick={() => loadHistory()}>Bid History</Button>}
                </ButtonGroup>

            </div>
        </>
    );
}

