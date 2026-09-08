import React, { useState } from "react";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import GeneralApiSvc from "../../../services/GeneralApiSvc";
import { AdminPanel } from "./AdminPanel";

const LEAGUES = [13894, 26548];

interface Result {
  franchises: number;
}

export function SalaryCapTrueUpAdmin() {
  const [loading, setLoading] = useState<number | null>(null);
  const [results, setResults] = useState<Record<number, Result>>({});
  const [errors, setErrors] = useState<Record<number, string>>({});

  const trueUp = async (leagueId: number) => {
    setLoading(leagueId);
    setErrors((e) => ({ ...e, [leagueId]: "" }));
    setResults((r) => {
      const { [leagueId]: _, ...rest } = r;
      return rest;
    });
    try {
      const data = await GeneralApiSvc.trueUpSalaryCaps(leagueId);
      setResults((r) => ({ ...r, [leagueId]: data }));
    } catch (err: any) {
      setErrors((e) => ({
        ...e,
        [leagueId]: err?.response?.data?.message ?? "Error truing up caps",
      }));
    } finally {
      setLoading(null);
    }
  };

  return (
    <AdminPanel title="Salary Cap True-Up">
      <Typography variant="body2" color="text.secondary" className="mb-3">
        Pulls cap room from MFL and writes to DB for all franchises in the league.
      </Typography>
      <div className="flex flex-col gap-3">
        {LEAGUES.map((leagueId) => (
          <div key={leagueId} className="flex items-center gap-3">
            <span className="font-semibold w-32">League {leagueId}</span>
            <Button
              variant="contained"
              size="small"
              disabled={loading === leagueId}
              onClick={() => trueUp(leagueId)}
            >
              {loading === leagueId ? <CircularProgress size={18} /> : "True Up Caps"}
            </Button>
            {results[leagueId] && (
              <Box component="span" className="text-sm" sx={{ color: "success.main" }}>
                Updated {results[leagueId].franchises} franchises
              </Box>
            )}
            {errors[leagueId] && (
              <Box component="span" className="text-sm" sx={{ color: "error.main" }}>
                {errors[leagueId]}
              </Box>
            )}
          </div>
        ))}
      </div>
    </AdminPanel>
  );
}
