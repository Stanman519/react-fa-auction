import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/reducers/RootReducer";
import {
  FranchiseStandings,
  SeasonFranchiseStanding,
} from "../../redux/reducers/TransactionReducer";
import { lastYear } from "../../services/Common";

export default function TriTable() {
  const ownerList = useSelector((state: RootState) => state.deadCap.deadCap);
  const leagueId = useSelector(
    (state: RootState) => state.profile.currentLeagueId,
  );
  const [standings, setStandings] = useState<FranchiseStandings[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [years, setYears] = useState<number[]>([]);
  const thisYear = lastYear + 1;
  const getDataAndFormat = () => {
    axios
      .get(
        `https://capncrunch-api.azurewebsites.net/Mfl/leagues/${leagueId}/years/${thisYear}/standings`,
      )
      .then((res) => {
        let sorted = res.data.sort(
          (a: FranchiseStandings, b: FranchiseStandings) =>
            a.teamStandings.reduce(
              (sum, ts) => sum + ts.pointsFor + ts.h2hWins * 10,
              0,
            ) >
            b.teamStandings.reduce(
              (sum, ts) => sum + ts.pointsFor + ts.h2hWins * 10,
              0,
            )
              ? -1
              : 1,
        );
        setStandings(sorted);

        setYears(
          res.data.length > 0
            ? res.data[0].teamStandings.map(
                (t: SeasonFranchiseStanding) => t.year,
              )
            : [],
        );
        if (res.status <= 300) setIsLoading(false);
      });
  };
  useEffect(() => {
    setIsLoading(true);
    setStandings([]);
    setYears([]);
    getDataAndFormat();
  }, [leagueId]);
  return (
    <Card>
      <CardContent>
        {!isLoading ? (
          standings.some((s) =>
            s.teamStandings.some((t) => t.pointsFor > 0),
          ) ? (
            <>
              <Box sx={{ mb: 2, px: 1 }}>
                <Typography variant="h4" fontWeight={800} color="primary.main" letterSpacing="-0.5px">
                  Tri-Year Trophy
                </Typography>
                <Typography variant="caption" color="text.secondary" fontStyle="italic" letterSpacing="0.05em">
                  Presented by Taco Bell
                </Typography>
              </Box>
              <TableContainer className="tri-scroll">
                <Table size={"small"}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'primary.main' }}>
                      <TableCell sx={{ border: 0 }} />
                      {years.map((y) => (
                        <React.Fragment key={y}>
                          <TableCell sx={{ border: 0 }} />
                          <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '0.9rem', textAlign: 'center', border: 0 }}>{y}</TableCell>
                          <TableCell sx={{ border: 0 }} />
                        </React.Fragment>
                      ))}
                    </TableRow>
                    <TableRow sx={{ backgroundColor: 'rgba(47,68,84,0.06)' }}>
                      <TableCell />
                      {years.map((y) => (
                        <React.Fragment key={y}>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', color: 'text.secondary' }}>Wins</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', color: 'text.secondary' }}>Pts For</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', color: 'text.secondary', borderRight: '2px solid', borderColor: 'divider' }}>TYT Pts</TableCell>
                        </React.Fragment>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {standings.map((row) => {
                      let totalTytPts = row.teamStandings.reduce(
                        (sum, ts) => sum + ts.pointsFor + ts.h2hWins * 10,
                        0,
                      );
                      const highestOfColumn = Math.max(
                        ...standings.map((row) =>
                          row.teamStandings.reduce(
                            (sum, ts) => sum + ts.pointsFor + ts.h2hWins * 10,
                            0,
                          ),
                        ),
                      );
                      return (
                        <TableRow className="horizontal" key={row.franchiseId}>
                          <TableCell className="team-text" sx={{ minWidth: 130, py: 1 }}>
                            {
                              ownerList.find(
                                (o) => o.franchiseId === row.franchiseId,
                              )?.team
                            }
                            <div>{totalTytPts.toFixed(1)} Pts</div>
                            <LinearProgress
                              color="secondary"
                              variant="determinate"
                              value={(totalTytPts / highestOfColumn) * 100}
                              sx={{ height: 6, borderRadius: 3, mt: 0.5 }}
                            />
                          </TableCell>
                          {row.teamStandings.map((tm, i) => {
                            return (
                              <React.Fragment key={i}>
                                <TableCell className="tritable-text">
                                  {tm.h2hWins ?? 0}
                                </TableCell>
                                <TableCell className="tritable-text">
                                  {tm.pointsFor ?? 0}
                                </TableCell>
                                <TableCell className="vertical tritable-text" sx={{ borderRight: '2px solid', borderColor: 'divider' }}>
                                  {tm.h2hWins * 10 + tm.pointsFor}
                                </TableCell>
                              </React.Fragment>
                            );
                          })}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          ) : (
            <div className="text-center">
              Tri-Year Trophy{" "}
              <span style={{ fontSize: 10 }}>presented by Taco Bell</span>{" "}
              standings will appear when the next cycle begins
            </div>
          )
        ) : (
          <CircularProgress />
        )}
      </CardContent>
    </Card>
  );
}
