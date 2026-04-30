import { useState, useRef } from "react";
import {
  Box,
  IconButton,
  Popover,
  TextField,
  Button,
  Tooltip,
} from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { postQuote, deleteQuote } from "../../redux/actions/QuoteActions";
import { terminal, fontStacks } from "../../../theme";

const MAX_QUOTE = 120;

interface QuoteButtonProps {
  playerMflId: number;
  playerName: string;
}

export const QuoteButton = ({ playerMflId, playerName }: QuoteButtonProps) => {
  const dispatch = useDispatch();
  const anchorRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  const currentLeague = useSelector((s: RootState) =>
    s.profile.owner.leagues.find(
      (l) => l.league.leagueId === s.profile.currentLeagueId,
    ),
  );
  const ownerId = currentLeague?.leagueownerid;
  const leagueId = currentLeague?.league.leagueId;
  const existing = useSelector((s: RootState) =>
    ownerId ? s.quotes.byKey[`${ownerId}:${playerMflId}`] : undefined,
  );

  const openPanel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDraft(existing?.text ?? "");
    setOpen(true);
  };

  const closePanel = () => setOpen(false);

  const onSave = async () => {
    if (!ownerId || !leagueId) return;
    const text = draft.trim();
    if (!text || text.length > MAX_QUOTE) return;
    setSaving(true);
    try {
      await (dispatch as any)(postQuote(leagueId, playerMflId, ownerId, text));
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!ownerId || !leagueId) return;
    setSaving(true);
    try {
      await (dispatch as any)(deleteQuote(leagueId, ownerId, playerMflId));
      setDraft("");
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const hasQuote = !!existing;
  const remaining = MAX_QUOTE - draft.length;

  return (
    <>
      <Tooltip title={hasQuote ? "edit quote" : "add quote"} placement="top">
        <IconButton
          ref={anchorRef}
          size="small"
          onClick={openPanel}
          sx={{
            p: 0.25,
            color: hasQuote ? terminal.lime : terminal.textMute,
          }}
        >
          {hasQuote ? (
            <ChatBubbleIcon fontSize="small" />
          ) : (
            <ChatBubbleOutlineIcon fontSize="small" />
          )}
        </IconButton>
      </Tooltip>
      <Popover
        open={open}
        anchorEl={anchorRef.current}
        onClose={closePanel}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              p: 1.25,
              width: 320,
              background: terminal.panel,
              border: `1px solid ${terminal.lineBold}`,
              fontFamily: fontStacks.mono,
            },
          },
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Box
          sx={{
            fontSize: 10,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: terminal.textMute,
            mb: 0.75,
          }}
        >
          your take on {playerName}
        </Box>
        <TextField
          autoFocus
          multiline
          minRows={2}
          maxRows={4}
          fullWidth
          value={draft}
          onChange={(e) => setDraft(e.target.value.slice(0, MAX_QUOTE))}
          placeholder="..."
          inputProps={{ maxLength: MAX_QUOTE }}
          sx={{
            "& .MuiInputBase-root": {
              fontFamily: fontStacks.mono,
              fontSize: 12,
              color: terminal.text,
              background: "#000",
            },
            "& fieldset": { borderColor: terminal.line },
          }}
        />
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 0.75,
          }}
        >
          <Box
            sx={{
              fontSize: 10,
              color: remaining < 20 ? terminal.amber : terminal.textMute,
              fontFamily: fontStacks.mono,
            }}
          >
            {remaining} left
          </Box>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            {hasQuote && (
              <Button
                size="small"
                onClick={onDelete}
                disabled={saving}
                sx={{
                  fontSize: 10,
                  color: terminal.textMute,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                clear
              </Button>
            )}
            <Button
              size="small"
              onClick={onSave}
              disabled={saving || !draft.trim()}
              variant="contained"
              sx={{
                fontSize: 10,
                background: terminal.lime,
                color: "#000",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                "&:hover": { background: terminal.lime, opacity: 0.9 },
              }}
            >
              save
            </Button>
          </Box>
        </Box>
      </Popover>
    </>
  );
};
