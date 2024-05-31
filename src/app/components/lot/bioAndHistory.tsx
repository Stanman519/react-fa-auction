
import { ListItem, ListItemAvatar, Avatar, ListItemText, List, Button, ButtonGroup, Drawer, Container, Typography, TableCell, Table, TableBody, TableContainer, TableHead, TableRow, Card, CardMedia, CardContent, useTheme, Divider, Skeleton } from "@mui/material";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PlayerBio } from "../../redux/reducers/FreeAgentReducer";
import { Bid } from "../../redux/reducers/LotReducer";
import AuctionApiSvc from "../../services/AuctionApiSvc";
import { getRankStringSuffix, lastYear, ownerMap, tmColorMap } from "../../services/Common";
import { RootState } from "../../store";
import { updateUI } from "../../redux/actions/UiActions";


export const PlayerBioSlab = (): JSX.Element => {
    const { isLoading, modal, currentPlayerBio } = useSelector((state: RootState) => state.ui)
    let bio = currentPlayerBio
    const theme = useTheme()
    const slabWidthMultiplier = window.innerWidth < 720 ? 0.7 : 0.4;
const dispatch = useDispatch()
    const getLocalBidTimeStamp = (expires: Date) => {
        let dayBefore = new Date(expires);
        dayBefore.setUTCDate(expires.getUTCDate() - 1)
        return `${dayBefore.toLocaleDateString()} ${dayBefore.toLocaleTimeString()} `
    }
    return (
        <> 
            <div style={{ display: 'flex', width: '100%' }}>
                <Drawer 

                    sx={{backgroundColor: 'transparent'}}
                    open={modal ===  'player-bio-slab'}
                    variant="temporary"
                    anchor="right"
                    onClose={() => dispatch(updateUI({modal: undefined}))}
                >
                    <Container style={{ backgroundColor: theme.palette.background.default, width: window.innerWidth * slabWidthMultiplier, maxWidth: 600, flexDirection: 'column', flex: 1 }}>
                        {isLoading !== 'slab' ?
                        <Card sx={{marginTop: '20px' }}>
                            <CardMedia component='img' image={bio?.actionShot} />
                                <CardContent>
                                    <List>
                                        <ListItem>
                                            <ListItemText>
                                                <Typography variant="h3">{bio?.firstName.toUpperCase()} {bio?.lastName.toUpperCase()}</Typography>
                                            </ListItemText>
                                        </ListItem>
                                        <Divider /> 
                                        <ListItem >
                                            <ListItemText>
                                                <Typography variant="h5"> {tmColorMap.find(tm => tm.team=== bio?.team)?.nickname ?? "Free Agent"} {bio?.position}</Typography>
                                            </ListItemText>
                                        </ListItem>
                                        <Divider /> 
                                        <ListItem>
                                            <ListItemText>
                                                {bio?.height && bio?.weight && <Typography variant="h5">{Math.floor(bio?.height / 12)}'{Math.floor(bio?.height % 12)}"</Typography>
}</ListItemText>
                                        </ListItem>
                                        <ListItem>
                                            <ListItemText>
                                                <Typography variant="h5">{bio?.weight} lbs </Typography>
                                            </ListItemText>
                                        </ListItem>
                                        <ListItem>
                                            <ListItemText>
                                                <Typography variant="h5">Age: {bio?.age}</Typography>
                                            </ListItemText>
                                        </ListItem>
                                        <Divider /> 
                                        <ListItem>
                                            <ListItemText secondary={bio?.draftRound ? `Rd. ${bio?.draftRound} Pk. ${bio?.draftPick} (${bio?.college})` : ''}>
                                                <Typography variant="h5">{bio?.draftRound ? `Drafted: ${bio?.draftYear}`: `${bio?.draftYear} undrafted`}</Typography>
                                            </ListItemText>
                                        </ListItem>
                                        <Divider />
                                        {/* {(bio?.lastSeasonSalary && bio.lastSeasonSalary > 0) && 
                                        <ListItem>
                                            <ListItemText secondary={`(${bio?.prevOwner})`}>
                                                <div>{`2023 Salary: ${bio?.lastSeasonSalary}`}</div>
                                            </ListItemText>
                                        </ListItem>} */}
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
                                    {!isLoading ? <TableContainer >
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

                {/* <ButtonGroup sx={{ display: 'flex', width: '100%' }} aria-label="small button group">
                    <Button  sx={{ flex: 1 }} onClick={() => loadBio()}>Bio</Button>
                    {bid?.expires && <Button sx={{ flex: 2, lineHeight: '14px' }} onClick={() => loadHistory()}>Bid History</Button>}
                    <Button>Open Offer Sheet</Button>
                </ButtonGroup> */}

            </div> 
        </>
    );
}

export const BidHistorySlab = (): JSX.Element => {
    const { owners } = useSelector((state: RootState) => state)
    const { modal, currentBidHistory } = useSelector((state: RootState) => state.ui)
    const dispatch = useDispatch()
    const getLocalBidTimeStamp = (expires: Date) => {
        let dayBefore = new Date(expires);
        dayBefore.setUTCDate(expires.getUTCDate() - 1)
        return `${dayBefore.toLocaleDateString()} ${dayBefore.toLocaleTimeString()} `
    }
    return (
        <>
            <div style={{ display: 'flex', width: '100%' }}>

                <Drawer
                    open={modal === 'bid-history-slab'}
                    variant="temporary"
                    anchor="right"
                    onClose={() => dispatch(updateUI({modal: undefined}))}
                >
                    <Container>
                        <List dense>
                            {currentBidHistory?.map(p =>{
                                const avatar = owners.find(o => o.leagueownerid === p.ownerId)?.avatar
                                return (<ListItem key={p.bidId}>
                                    <img onClick={() => console.log('hi')}  src={avatar} referrerPolicy="no-referrer" style={{ height: 0, width: 0 }} />
                                    <ListItemAvatar>
                                        <Avatar src={avatar}/>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={`$${p.bidSalary}, ${p.bidLength} ${p.bidLength=== 1 ? 'year' : 'years'}`}
                                        secondary={`${getLocalBidTimeStamp(new Date(p.expires ?? ""))}`}
                                    />
                                </ListItem>)
})}
                        </List>
                    </Container>
                </Drawer>
            </div>
        </>
    );
}



