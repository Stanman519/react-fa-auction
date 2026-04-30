import React, { useState } from "react";
import { Button, CircularProgress } from "@mui/material";
import GeneralApiSvc from "../../../services/GeneralApiSvc";

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
    <div className="p-4 border rounded mt-6">
      <h2 className="text-lg font-bold mb-3">Salary Cap True-Up</h2>
      <p className="text-sm text-gray-600 mb-3">
        Pulls cap room from MFL and writes to DB for all franchises in the league.
      </p>
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
              <span className="text-green-600 text-sm">
                Updated {results[leagueId].franchises} franchises
              </span>
            )}
            {errors[leagueId] && (
              <span className="text-red-500 text-sm">{errors[leagueId]}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
