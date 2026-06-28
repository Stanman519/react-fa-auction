import React, { useState } from "react";
import { Button, CircularProgress, TextField } from "@mui/material";
import AuctionApiSvc from "../../../services/AuctionApiSvc";

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
    <div className="p-4 border rounded mt-6">
      <h2 className="text-lg font-bold mb-3">Extend Active Bid Timers (Pause)</h2>
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
              <span style={{ color: "green" }} className="text-sm">
                Extended {results[leagueId]} bid{results[leagueId] !== 1 ? "s" : ""}
              </span>
            )}
            {errors[leagueId] && (
              <span style={{ color: "red" }} className="text-sm">{errors[leagueId]}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
