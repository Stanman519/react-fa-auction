import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import AuctionApiSvc, { RosterOwner } from "../services/AuctionApiSvc";
import { OpposingFranchiseDTO } from "../redux/reducers/OwnerReducer";

function AuctionRosters() {
  const { currentLeague } = useSelector((state: RootState) => state.profile);
  const dispatch = useDispatch();
  const [rosters, setRosters] = useState<RosterOwner[]>([]);
  const [selection, setSelection] = useState<RosterOwner | undefined>(
    undefined,
  );
  const [owners, setOwners] = useState<OpposingFranchiseDTO[]>([]);
  useEffect(() => {
    const ugh = async () => {
      if (currentLeague?.league.leagueId) {
        const res = await AuctionApiSvc.getRosters(
          currentLeague.league.leagueId,
        );
        setRosters(res);
        const owners = res.map((r) => {
          return { ...r } as OpposingFranchiseDTO;
        });

        setOwners(owners);
      }
    };
    ugh();
  }, []);
  const handleChange = (event: SelectChangeEvent) => {
    const id = event.target.value;
    const selection = rosters.find((r) => r.mflfranchiseid == +id);
    if (!selection) return;
    setSelection(selection);
  };

  return (
    <div style={{ marginLeft: 8, marginRight: 8 }}>
      <div className="text-3xl">Rosters</div>
      <div>Presented By Eduardo</div>
      <FormControl
        style={{ marginTop: 8, marginRight: 16, marginLeft: 16, width: "50%" }}
      >
        <InputLabel id="demo-simple-select-label">Choose Team</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={`${selection?.mflfranchiseid}` ?? ""}
          label="Choose Team"
          onChange={handleChange}
        >
          {owners.map((o) => {
            return (
              <MenuItem key={o.mflfranchiseid} value={o.mflfranchiseid}>
                {o.ownerName}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
      <TableContainer component={Paper} style={{ maxWidth: 800 }}>
        <Table>
          {(selection?.players?.length ?? 0) > 0 && (
            <TableHead>
              <TableRow>
                <TableCell>First</TableCell>
                <TableCell>Last</TableCell>
                <TableCell>Pos</TableCell>
                <TableCell>$$</TableCell>
                <TableCell>Years</TableCell>
              </TableRow>
            </TableHead>
          )}
          {selection?.players.map((p) => {
            return (
              <TableRow>
                <TableCell>{p.firstName}</TableCell>
                <TableCell>{p.lastName}</TableCell>
                <TableCell>{p.position}</TableCell>
                <TableCell>{p.salary}</TableCell>
                <TableCell>{p.length}</TableCell>
              </TableRow>
            );
          })}
        </Table>
      </TableContainer>
    </div>
  );
}

export default AuctionRosters;
