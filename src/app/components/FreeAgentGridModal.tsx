import {
  Box,
  Dialog,
  IconButton,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateUI } from "../redux/actions/UiActions";
import { RootState } from "../store";
import { PlayerDTO } from "../redux/reducers/FreeAgentReducer";
import { fontStacks, terminal } from "../../theme";

const POS_COLORS: Record<string, string> = {
  QB: "#e8538a",
  RB: "#2ca579",
  WR: "#4a90e2",
  TE: "#c47a2b",
};

const POSITIONS = ["QB", "RB", "WR", "TE"] as const;

type SortKey = "fullName" | "position" | "team" | "age" | "adp";
type SortDir = "asc" | "desc";

const hCell = {
  background: terminal.bg,
  borderBottom: `1px solid ${terminal.lineBold}`,
  py: 1,
  px: 2,
};

const dCell = {
  borderBottom: `1px solid ${terminal.line}`,
  py: 0.75,
  px: 2,
  fontSize: 13,
  color: terminal.text,
};

function SortHeader({
  label,
  col,
  sortKey,
  sortDir,
  onSort,
}: {
  label: string;
  col: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (k: SortKey) => void;
}) {
  const active = col === sortKey;
  return (
    <Box
      onClick={() => onSort(col)}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        cursor: "pointer",
        color: active ? terminal.lime : terminal.textMute,
        fontFamily: fontStacks.mono,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.1em",
        userSelect: "none",
        "&:hover": { color: terminal.lime },
      }}
    >
      {label}
      {active && (
        <Box component="span" sx={{ fontSize: 11, lineHeight: 1 }}>
          {sortDir === "asc" ? "↑" : "↓"}
        </Box>
      )}
    </Box>
  );
}

export const FreeAgentGridModal = ({
  isOpen = false,
}: {
  isOpen: boolean;
}): JSX.Element => {
  const dispatch = useDispatch();
  const freeAgents = useSelector((state: RootState) => state.freeAgents);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  const [search, setSearch] = useState("");
  const [posFil, setPosFil] = useState<string[]>([]);
  const [hideFA, setHideFA] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("adp");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const togglePos = (pos: string) =>
    setPosFil((prev) =>
      prev.includes(pos) ? prev.filter((p) => p !== pos) : [...prev, pos],
    );

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const displayed = useMemo(() => {
    let list: PlayerDTO[] = [...freeAgents];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.fullName.toLowerCase().includes(q));
    }

    if (posFil.length > 0) {
      list = list.filter((p) => posFil.includes(p.position));
    }

    if (hideFA) {
      list = list.filter((p) => p.team !== "FA");
    }

    list.sort((a, b) => {
      let av: string | number, bv: string | number;
      switch (sortKey) {
        case "fullName":
          av = a.fullName;
          bv = b.fullName;
          break;
        case "position":
          av = a.position;
          bv = b.position;
          break;
        case "team":
          av = a.team;
          bv = b.team;
          break;
        case "age":
          av = a.age ?? 999;
          bv = b.age ?? 999;
          break;
        case "adp":
          av = +(a.adp ?? 0) || 9999;
          bv = +(b.adp ?? 0) || 9999;
          break;
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [freeAgents, search, posFil, hideFA, sortKey, sortDir]);

  const close = () => dispatch(updateUI({ modal: undefined }));

  const pillSx = (active: boolean) => ({
    height: 28,
    px: 1.5,
    border: `1px solid ${active ? terminal.lime : terminal.lineBold}`,
    borderRadius: "3px",
    background: active ? terminal.lime : "transparent",
    color: active ? "#000" : terminal.textDim,
    fontFamily: fontStacks.mono,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.06em",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    userSelect: "none",
    transition: "border-color 0.1s, background 0.1s, color 0.1s",
    "&:hover": {
      borderColor: terminal.lime,
      color: active ? "#000" : terminal.lime,
    },
  });

  return (
    <Dialog
      open={isOpen}
      onClose={close}
      fullScreen={fullScreen}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: fullScreen ? "100%" : 820,
          maxWidth: "100%",
          height: fullScreen ? "100%" : "85vh",
          background: terminal.panel,
          color: terminal.text,
          border: fullScreen ? "none" : `1px solid ${terminal.lineBold}`,
          borderRadius: fullScreen ? 0 : "3px",
          display: "flex",
          flexDirection: "column",
          m: fullScreen ? 0 : undefined,
          overflow: "hidden",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2.5,
          height: 52,
          borderBottom: `1px solid ${terminal.lineBold}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1.5 }}>
          <Box
            sx={{
              fontFamily: fontStacks.mono,
              fontWeight: 800,
              fontSize: 13,
              letterSpacing: "0.12em",
              color: terminal.lime,
            }}
          >
            FREE AGENTS
          </Box>
          <Box
            sx={{
              fontFamily: fontStacks.mono,
              fontSize: 11,
              color: terminal.textMute,
            }}
          >
            {displayed.length} players
          </Box>
        </Box>
        <IconButton size="small" onClick={close} sx={{ color: terminal.textDim }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Controls */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: `1px solid ${terminal.lineBold}`,
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <TextField
          size="small"
          placeholder="Search player…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 16, color: terminal.textMute }} />
              </InputAdornment>
            ),
          }}
          sx={{
            width: 200,
            "& .MuiOutlinedInput-root": {
              fontFamily: fontStacks.sans,
              fontSize: 13,
              color: terminal.text,
              background: terminal.bg,
              borderRadius: "3px",
              "& fieldset": { borderColor: terminal.lineBold },
              "&:hover fieldset": { borderColor: terminal.lime },
              "&.Mui-focused fieldset": { borderColor: terminal.lime },
            },
            "& input::placeholder": { color: terminal.textMute, opacity: 1 },
          }}
        />

        <Box sx={{ display: "flex", gap: 0.75 }}>
          {POSITIONS.map((pos) => (
            <Box key={pos} sx={pillSx(posFil.includes(pos))} onClick={() => togglePos(pos)}>
              {pos}
            </Box>
          ))}
        </Box>

        <Box sx={pillSx(hideFA)} onClick={() => setHideFA((v) => !v)}>
          HIDE FA
        </Box>
      </Box>

      {/* Table */}
      <TableContainer sx={{ flex: 1, overflow: "auto" }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={hCell}>
                <SortHeader label="NAME" col="fullName" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              </TableCell>
              <TableCell sx={{ ...hCell, width: 60 }}>
                <SortHeader label="POS" col="position" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              </TableCell>
              <TableCell sx={{ ...hCell, width: 64 }}>
                <SortHeader label="TEAM" col="team" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              </TableCell>
              {!fullScreen && (
                <TableCell sx={{ ...hCell, width: 56 }}>
                  <SortHeader label="AGE" col="age" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                </TableCell>
              )}
              <TableCell sx={{ ...hCell, width: 64 }}>
                <SortHeader label="ADP" col="adp" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayed.map((p, i) => (
              <TableRow
                key={p.mflId}
                sx={{
                  background: i % 2 === 0 ? terminal.panel : terminal.panel2,
                  "&:hover td": { background: "rgba(255,255,255,0.03)" },
                }}
              >
                <TableCell sx={dCell}>
                  <Box
                    sx={{
                      fontFamily: fontStacks.sans,
                      fontSize: fullScreen ? 13 : 14,
                      color: terminal.text,
                    }}
                  >
                    {p.fullName}
                  </Box>
                </TableCell>
                <TableCell sx={dCell}>
                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      px: 0.75,
                      height: 18,
                      borderRadius: "2px",
                      background: POS_COLORS[p.position] ?? "#555",
                      fontFamily: fontStacks.mono,
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#fff",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {p.position}
                  </Box>
                </TableCell>
                <TableCell
                  sx={{
                    ...dCell,
                    color: p.team === "FA" ? terminal.textMute : terminal.text,
                  }}
                >
                  {p.team}
                </TableCell>
                {!fullScreen && (
                  <TableCell sx={{ ...dCell, color: terminal.textDim }}>
                    {p.age ?? "—"}
                  </TableCell>
                )}
                <TableCell
                  sx={{
                    ...dCell,
                    fontFamily: fontStacks.mono,
                    color: terminal.textDim,
                  }}
                >
                  {p.adp ?? "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Dialog>
  );
};
