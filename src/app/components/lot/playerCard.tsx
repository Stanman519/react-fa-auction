import { Autocomplete, Box, TextField, useTheme } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { PlayerDTO } from "../../redux/reducers/FreeAgentReducer";
import { Lot } from "../../redux/reducers/LotReducer";
import { RootState } from "../../store";
import { useState } from "react";
import { selectPlayerToNominate } from "../../redux/actions/LotActions";
import { terminal, fontStacks } from "../../../theme";
import { dfs } from "../nonAuction/terminal/tokens";

interface PlayerCardProps {
  lot: Lot;
}

const POS_COLORS: Record<string, string> = {
  QB: "#e8538a",
  RB: "#2ca579",
  WR: "#4a90e2",
  TE: "#c47a2b",
  K: "#8888aa",
  DEF: "#6b6b6b",
  PK: "#8888aa",
};

const PosBadge = ({ pos }: { pos?: string }) => {
  if (!pos) return null;
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        height: 22,
        minWidth: 22,
        px: 0.75,
        borderRadius: "2px",
        background: POS_COLORS[pos] ?? "#666",
        color: "#fff",
        fontFamily: fontStacks.mono,
        fontWeight: 700,
        fontSize: 10,
        letterSpacing: "0.02em",
      }}
    >
      {pos}
    </Box>
  );
};

export const PlayerCard = ({ lot }: PlayerCardProps) => {
  const { freeAgents } = useSelector((state: RootState) => state);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerDTO>();
  const dispatch = useDispatch();
  const theme = useTheme();
  const selectPlayerForNom = (player: PlayerDTO) => {
    setSelectedPlayer(player);
    dispatch(selectPlayerToNominate(player));
  };

  const player = lot.bid?.player;
  const hasBid = !!lot.bid?.bidId && !!player;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        p: 2,
        borderBottom: `1px solid ${terminal.line}`,
      }}
    >
      {hasBid ? (
        <>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: "4px",
              background: terminal.panel2,
              border: `1px solid ${terminal.line}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            {player?.headshot ? (
              <img
                src={player.headshot}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center top",
                }}
              />
            ) : (
              <Box
                sx={{
                  fontFamily: fontStacks.mono,
                  fontWeight: 800,
                  fontSize: dfs(18),
                  color: terminal.text,
                }}
              >
                {(player?.firstName?.[0] ?? "") + (player?.lastName?.[0] ?? "")}
              </Box>
            )}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexWrap: "wrap",
              }}
            >
              <PosBadge pos={player?.position} />
              <Box
                sx={{
                  fontFamily: fontStacks.mono,
                  fontSize: dfs(11),
                  color: terminal.textDim,
                  letterSpacing: "0.02em",
                }}
              >
                {player?.team?.toUpperCase()}
                {player?.age ? ` · AGE ${player.age}` : ""}
              </Box>
            </Box>
            <Box
              sx={{
                color: theme.palette.text.primary,
                fontSize: dfs(18),
                fontWeight: 700,
                mt: 0.25,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {player?.firstName} {player?.lastName}
            </Box>
          </Box>
        </>
      ) : (
        <Autocomplete
          isOptionEqualToValue={(option, value) => option.mflId === value.mflId}
          disablePortal
          options={freeAgents}
          value={
            selectedPlayer ?? ({ firstName: "", lastName: "" } as PlayerDTO)
          }
          onChange={(_e, newValue) => {
            if (newValue) selectPlayerForNom(newValue);
          }}
          sx={{ flex: 1 }}
          getOptionLabel={(option) =>
            `${option.position ?? ""} ${option.fullName ?? ""}`
          }
          renderInput={(params) => (
            <TextField {...params} label="Choose a player" size="small" />
          )}
        />
      )}
    </Box>
  );
};
