import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AuctionApiSvc, { RosterOwner } from "../services/AuctionApiSvc";

function AuctionRosters() {
  const { currentLeagueId } = useSelector((state: RootState) => state.profile);
  const currentLeague = useSelector((state: RootState) =>
    state.profile.owner.leagues.find(
      (l) => l.league.leagueId === currentLeagueId,
    ),
  );
  const [rosters, setRosters] = useState<RosterOwner[]>([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const fetchRosters = async () => {
      if (currentLeague?.league.leagueId) {
        const res = await AuctionApiSvc.getRosters(currentLeague.league.leagueId);
        setRosters(res);
      }
    };
    fetchRosters();
  }, []);

  const filtered = filter
    ? rosters.filter((r) =>
        r.teamName?.toLowerCase().includes(filter.toLowerCase()) ||
        r.ownerName?.toLowerCase().includes(filter.toLowerCase()),
      )
    : rosters;

  // Group picks by year for a franchise
  const picksByYear = (picks: RosterOwner["draftPicks"]) => {
    const groups: Record<string, string[]> = {};
    (picks ?? []).forEach((p) => {
      const yr = p.year ?? "?";
      if (!groups[yr]) groups[yr] = [];
      groups[yr].push(p.description ?? `Round ${p.round}`);
    });
    return groups;
  };

  return (
    <div style={{ marginLeft: 8, marginRight: 8, marginTop: 8 }}>
      <div className="text-3xl">Rosters</div>
      <div style={{ marginBottom: 8 }}>Presented By Eduardo</div>
      <TextField
        size="small"
        label="Filter team"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{ marginBottom: 12, width: 240 }}
      />
      {filtered.map((r) => {
        const picks = picksByYear(r.draftPicks);
        const pickYears = Object.keys(picks).sort();
        return (
          <Accordion key={r.mflfranchiseid} defaultExpanded={false}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <div className="flex items-center gap-3 w-full">
                <Typography fontWeight="bold">{r.teamName}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {r.ownerName}
                </Typography>
                <Chip
                  size="small"
                  label={`Cap: $${r.capRoom}`}
                  color={r.capRoom >= 0 ? "success" : "error"}
                  style={{ marginLeft: "auto" }}
                />
              </div>
            </AccordionSummary>
            <AccordionDetails style={{ padding: 0 }}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>First</TableCell>
                      <TableCell>Last</TableCell>
                      <TableCell>Pos</TableCell>
                      <TableCell>$$</TableCell>
                      <TableCell>Years</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {r.players?.map((p) => (
                      <TableRow key={p.mflId}>
                        <TableCell>{p.firstName}</TableCell>
                        <TableCell>{p.lastName}</TableCell>
                        <TableCell>{p.position}</TableCell>
                        <TableCell>{p.salary}</TableCell>
                        <TableCell>{p.length}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {pickYears.length > 0 && (
                <div style={{ padding: "8px 16px" }}>
                  <Typography variant="subtitle2" style={{ marginBottom: 4 }}>
                    Draft Picks
                  </Typography>
                  {pickYears.map((yr) => (
                    <div key={yr} style={{ marginBottom: 4 }}>
                      <Typography variant="body2" fontWeight="bold">
                        {yr}
                      </Typography>
                      {picks[yr].map((desc, i) => (
                        <Typography key={i} variant="body2" style={{ paddingLeft: 12 }}>
                          {desc}
                        </Typography>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </AccordionDetails>
          </Accordion>
        );
      })}
    </div>
  );
}

export default AuctionRosters;
