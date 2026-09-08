import React, { useState } from "react";
import { Box, Button, CircularProgress, TextField } from "@mui/material";
import GeneralApiSvc from "../../../services/GeneralApiSvc";
import { AdminPanel } from "./AdminPanel";

interface TagValues {
  mflleagueid: number;
  year: number;
  qb: number;
  rb: number;
  wr: number;
  te: number;
  qbTop3: number;
  rbTop3: number;
  wrTop3: number;
  teTop3: number;
}

const LEAGUES = [13894, 26548];

export function FranchiseTagAdmin() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState<number | null>(null);
  const [results, setResults] = useState<Record<number, TagValues>>({});
  const [errors, setErrors] = useState<Record<number, string>>({});

  const generate = async (leagueId: number) => {
    setLoading(leagueId);
    setErrors((e) => ({ ...e, [leagueId]: "" }));
    try {
      const data = await GeneralApiSvc.generateFranchiseTagValues(leagueId, year);
      setResults((r) => ({ ...r, [leagueId]: data }));
    } catch (err: any) {
      setErrors((e) => ({
        ...e,
        [leagueId]: err?.response?.data?.message ?? "Error generating tag values",
      }));
    } finally {
      setLoading(null);
    }
  };

  return (
    <AdminPanel title="Franchise Tag Value Generator">
      <div className="flex items-center gap-3 mb-4">
        <TextField
          label="Year"
          type="number"
          size="small"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        />
      </div>
      <div className="flex flex-col gap-4">
        {LEAGUES.map((leagueId) => (
          <Box key={leagueId} className="p-3" sx={{ border: 1, borderColor: "divider", borderRadius: 1 }}>
            <div className="flex items-center gap-3 mb-2">
              <span className="font-semibold">League {leagueId}</span>
              <Button
                variant="contained"
                size="small"
                disabled={loading === leagueId}
                onClick={() => generate(leagueId)}
              >
                {loading === leagueId ? <CircularProgress size={18} /> : "Generate"}
              </Button>
            </div>
            {errors[leagueId] && (
              <Box component="p" className="text-sm" sx={{ color: "error.main" }}>
                {errors[leagueId]}
              </Box>
            )}
            {results[leagueId] && (
              <table className="text-sm w-full mt-2">
                <thead>
                  <tr className="text-left">
                    <th className="pr-4">Position</th>
                    <th className="pr-4">Top-6 Avg (Tag)</th>
                    <th>Top-3 Avg (2nd Tag)</th>
                  </tr>
                </thead>
                <tbody>
                  {(["QB", "RB", "WR", "TE"] as const).map((pos) => {
                    const r = results[leagueId];
                    const posLower = pos.toLowerCase() as "qb" | "rb" | "wr" | "te";
                    return (
                      <tr key={pos}>
                        <td className="pr-4 font-medium">{pos}</td>
                        <td className="pr-4">${r[posLower]}</td>
                        <td>${r[`${posLower}Top3` as keyof TagValues]}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </Box>
        ))}
      </div>
    </AdminPanel>
  );
}
