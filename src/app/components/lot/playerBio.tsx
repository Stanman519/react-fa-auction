import { Box, Skeleton, Collapse } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Lot } from "../../redux/reducers/LotReducer";
import { RootState } from "../../redux/reducers/RootReducer";
import { loadPlayerBio } from "../../redux/actions/UiActions";
import { terminal, fontStacks } from "../../../theme";
import { dfs } from "../nonAuction/terminal/tokens";
import { getRankStringSuffix } from "../../services/Common";

interface Props {
  lot: Lot;
}

const labelSx = {
  fontFamily: fontStacks.mono,
  fontSize: dfs(9),
  letterSpacing: "0.08em",
  color: terminal.textMute,
  textTransform: "uppercase" as const,
};

const valueSx = {
  fontFamily: fontStacks.mono,
  fontSize: dfs(11),
  fontWeight: 700,
  fontVariantNumeric: "tabular-nums",
  color: terminal.text,
};

export const PlayerBio = ({ lot }: Props): JSX.Element | null => {
  const player = lot.bid?.player;
  const [expanded, setExpanded] = useState(false);
  const dispatch = useDispatch();
  const bio = useSelector((s: RootState) =>
    player ? s.ui.playerBioCache?.[player.mflId] : undefined,
  );

  if (!player) return null;

  const onToggle = () => {
    if (!expanded && !bio) dispatch(loadPlayerBio(lot.bid));
    setExpanded((e) => !e);
  };

  const ft = bio ? Math.floor(bio.height / 12) : 0;
  const inches = bio ? bio.height % 12 : 0;
  const ranks = bio?.positionRanks?.filter((r) => r.points > 0) ?? [];

  return (
    <Box
      sx={{
        borderTop: `1px solid ${terminal.line}`,
        borderBottom: `1px solid ${terminal.line}`,
      }}
    >
      <Box
        component="button"
        onClick={onToggle}
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: terminal.panel2,
          border: "none",
          px: 1.5,
          py: 0.75,
          cursor: "pointer",
          color: terminal.textDim,
          "&:hover": { color: terminal.text },
        }}
      >
        <Box sx={labelSx}>Player Bio</Box>
        <ExpandMoreIcon
          fontSize="small"
          sx={{
            transition: "transform 200ms ease",
            transform: expanded ? "rotate(180deg)" : "rotate(0)",
          }}
        />
      </Box>
      <Collapse in={expanded} unmountOnExit>
        <Box sx={{ px: 1.5, py: 1.25, background: terminal.panel }}>
          {!bio ? (
            <>
              <Skeleton
                variant="text"
                sx={{ bgcolor: terminal.panel2, mb: 0.5 }}
                width="80%"
              />
              <Skeleton
                variant="text"
                sx={{ bgcolor: terminal.panel2, mb: 1 }}
                width="60%"
              />
              <Skeleton
                variant="rectangular"
                sx={{ bgcolor: terminal.panel2 }}
                height={70}
              />
            </>
          ) : (
            <>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 0.75,
                  mb: 1,
                }}
              >
                <Cell label="HT" value={`${ft}'${inches}"`} />
                <Cell label="WT" value={`${bio.weight}`} />
                <Cell label="AGE" value={`${bio.age}`} />
                <Cell label="COLLEGE" value={bio.college || "—"} truncate />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  alignItems: "baseline",
                  mb: ranks.length ? 1.25 : 0,
                }}
              >
                <Box sx={labelSx}>Draft</Box>
                <Box sx={{ ...valueSx, fontSize: dfs(11) }}>
                  {bio.draftRound
                    ? `${bio.draftYear} · R${bio.draftRound} P${bio.draftPick}`
                    : `${bio.draftYear} · UNDRAFTED`}
                </Box>
              </Box>
              {ranks.length > 0 && (
                <Box
                  sx={{
                    border: `1px solid ${terminal.line}`,
                    borderRadius: "2px",
                  }}
                >
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      px: 1,
                      py: 0.5,
                      background: terminal.panel2,
                      borderBottom: `1px solid ${terminal.line}`,
                      ...labelSx,
                    }}
                  >
                    <Box>Year</Box>
                    <Box sx={{ textAlign: "right" }}>Pts</Box>
                    <Box sx={{ textAlign: "right" }}>Rnk</Box>
                  </Box>
                  {ranks.map((r) => (
                    <Box
                      key={r.year}
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        px: 1,
                        py: 0.4,
                        ...valueSx,
                        fontSize: dfs(11),
                        "&:not(:last-of-type)": {
                          borderBottom: `1px solid ${terminal.line}`,
                        },
                      }}
                    >
                      <Box>{r.year}</Box>
                      <Box sx={{ textAlign: "right" }}>
                        {Math.floor(r.points)}
                      </Box>
                      <Box sx={{ textAlign: "right", color: terminal.lime }}>
                        {getRankStringSuffix(r.rank)}
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </>
          )}
        </Box>
      </Collapse>
    </Box>
  );
};

const Cell = ({
  label,
  value,
  truncate,
}: {
  label: string;
  value: string;
  truncate?: boolean;
}) => (
  <Box>
    <Box sx={labelSx}>{label}</Box>
    <Box
      sx={{
        ...valueSx,
        ...(truncate
          ? {
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }
          : {}),
      }}
    >
      {value}
    </Box>
  </Box>
);
