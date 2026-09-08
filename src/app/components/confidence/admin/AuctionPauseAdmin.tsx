import React, { useState } from "react";
import { Box, Button, CircularProgress, TextField } from "@mui/material";
import AuctionApiSvc from "../../../services/AuctionApiSvc";
import { AdminPanel } from "./AdminPanel";

const LEAGUES = [13894, 26548];

export function AuctionPauseAdmin() {
  const [hours, setHours] = useState(2);
  const [loading, setLoading] = useState<number | null>(null);
  const [results, setResults] = useState<Record<number, number>>({});
  const [errors, setErrors] = useState<Record<number, string>>({});

  const extend = async (leagueId: number) => {
    setLoading(leagueId);
    setErrors((e) => ({ ...e, [leagueId]: "" }));
    setResults((r) => { const { [leagueId]: _, ...rest } = r; return rest; });
    try {
      const data = await AuctionApiSvc.extendBids(leagueId, hours);
      setResults((r) => ({ ...r, [leagueId]: data.count }));
    } catch (err: any) {
      setErrors((e) => ({ ...e, [leagueId]: err?.message ?? "Error extending bids" }));
    } finally {
      setLoading(null);
    }
  };

  return (
    <AdminPanel title="Extend Active Bid Timers (Pause)">
      <div className="flex items-center gap-3 mb-4">
        <TextField
          label="Hours to add"
          type="number"
          size="small"
          value={hours}
          inputProps={{ min: 1, max: 48 }}
          onChange={(e) => setHours(Number(e.target.value))}
        />
      </div>
      <div className="flex flex-col gap-3">
        {LEAGUES.map((leagueId) => (
          <div key={leagueId} className="flex items-center gap-3">
            <span className="font-semibold w-32">League {leagueId}</span>
            <Button
              variant="contained"
              size="small"
              disabled={loading === leagueId}
              onClick={() => extend(leagueId)}
            >
              {loading === leagueId ? <CircularProgress size={18} /> : "Extend"}
            </Button>
            {results[leagueId] !== undefined && (
              <Box component="span" className="text-sm" sx={{ color: "success.main" }}>
                Extended {results[leagueId]} bid{results[leagueId] !== 1 ? "s" : ""}
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
