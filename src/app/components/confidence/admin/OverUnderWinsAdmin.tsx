import React, { useState } from "react";
import { Box, Button, CircularProgress } from "@mui/material";
import GeneralApiSvc from "../../../services/GeneralApiSvc";
import { AdminPanel } from "./AdminPanel";

export function OverUnderWinsAdmin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const update = async () => {
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      await GeneralApiSvc.updateNflTeamWins();
      setSuccess(true);
    } catch (err: any) {
      setError(err?.response?.data ?? "Error updating NFL win totals");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminPanel title="NFL Win Totals">
      <div className="flex items-center gap-3">
        <Button variant="contained" size="small" disabled={loading} onClick={update}>
          {loading ? <CircularProgress size={18} /> : "Update NFL Win Totals"}
        </Button>
        {success && (
          <Box component="span" className="text-sm" sx={{ color: "success.main" }}>
            Updated
          </Box>
        )}
      </div>
      {error && (
        <Box component="p" className="text-sm mt-2" sx={{ color: "error.main" }}>
          {error}
        </Box>
      )}
    </AdminPanel>
  );
}
