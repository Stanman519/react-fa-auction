import { Avatar, Box, Divider, Drawer, List, ListItem, ListItemText, useTheme } from "@mui/material"
import { useDispatch, useSelector } from "react-redux";

import { updateUI } from "../redux/actions/UiActions";
import { useMemo } from "react";
import { OpposingFranchiseDTO } from "../redux/reducers/OwnerReducer";
import { RootState } from "../store";

interface CurrentBids {
    ownerId: number;
    bidSalary: number;
}

const groupOwners = (owners: OpposingFranchiseDTO[]) => {
    const groupedOwners: { [key: number]: OpposingFranchiseDTO } = {};
    owners.forEach(owner => {
        const { mflfranchiseid, ownerName, avatar } = owner;

        if (!groupedOwners[mflfranchiseid]) {
            groupedOwners[mflfranchiseid] = { ...owner, ownerName: '', avatar: avatar };
        }3
        if (groupedOwners[mflfranchiseid].ownerName) {
            groupedOwners[mflfranchiseid].ownerName += ` AKA ${ownerName}`;
        } else {
            groupedOwners[mflfranchiseid].ownerName = ownerName;
        }
    });
    return Object.values(groupedOwners);
};

export const AuctionTeamSalaryCapsSlab = (): JSX.Element => {
    const owners = useSelector((state: RootState) => state.owners);
    const groupedOwners = useMemo(() => groupOwners(owners), [owners]);
    const { palette } = useTheme();
    const { currentLeague } = useSelector((state: RootState) => state.profile);
    const openSlab = useSelector((state: RootState) => state.ui.modal === 'team-caps-slab');
    const dispatch = useDispatch();
    const lots = useSelector((state: RootState) => state.lots.filter(l => l.leagueId === currentLeague?.league.leagueId ?? 0));

    const highBidsForOwners = useMemo(() => {
        const bids: { [key: number]: number } = {};
        groupedOwners.forEach(owner => {
            bids[owner.leagueownerid] = lots
                .filter(l => l.bid?.ownerId === owner.leagueownerid)
                .map(b => b.bid?.bidSalary ?? 0)
                .reduce((prev, curr) => prev + curr, 0);
        });
        return bids;
    }, [lots, groupedOwners]);


    return (
    <Drawer
            anchor={'left'}
            open={openSlab}
            onClose={() => dispatch(updateUI({modal: undefined}))}
            >
        <Box
            sx={{ width: 250, height: '100%' }}
            role="presentation"
            onClick={() => dispatch(updateUI({modal: undefined}))}
            bgcolor={palette.background.default}
        >
            <List>
                {groupedOwners.map((o, index) => (
                    <ListItem key={o.leagueownerid} style={{ backgroundColor: index % 2 === 0 ? palette.background.default : palette.background.paper }}>
                        <img src={o.avatar} referrerPolicy="no-referrer" style={{ height: 0, width: 0 }} />
                        <Avatar style={{ marginRight: 8, cursor: 'pointer' }} sx={{ height: 50, width: 50 }} alt={o.ownerName} src={o.avatar}  />
                        <div style={{flexDirection: 'column'}}>
                            <ListItemText style={{}} primary={`${o.ownerName} - $${o?.capRoom}`} secondary={highBidsForOwners[o.leagueownerid] ?? 0 > 0 ? `outstanding bids: $${highBidsForOwners[o.leagueownerid]}`: ''} />
                        </div>
                    
                    </ListItem>
                ))}
                <Divider />
    </List>

</Box>
</Drawer>

)
}