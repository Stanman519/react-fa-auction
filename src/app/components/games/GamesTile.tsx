import { Box, Tooltip } from "@mui/material";
import { terminal as T, fontStacks } from "../../../theme";

export interface GamesTileProps {
  imgFile: string;
  altTitle: string;
  onClick: () => void;
  disabled: boolean;
  tooltip: string;
}

export const GamesTile = ({
  imgFile,
  altTitle,
  onClick,
  disabled,
  tooltip,
}: GamesTileProps): JSX.Element => {
  return (
    <Tooltip title={tooltip} arrow>
      <Box
        onClick={!disabled ? onClick : undefined}
        sx={{
          background: T.panel,
          border: `1px solid ${T.line}`,
          cursor: disabled ? "not-allowed" : "pointer",
          display: "flex",
          flexDirection: "column",
          transition: "background 0.2s ease, border-color 0.2s ease",
          "&:hover": {
            background: disabled ? T.panel : T.panel2,
            borderColor: disabled ? T.line : T.lineBold,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            px: 1.25,
            height: 32,
            borderBottom: `1px solid ${T.line}`,
          }}
        >
          <span
            style={{
              fontFamily: fontStacks.mono,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: disabled ? T.textMute : T.text,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {altTitle.replace(/ Game$/, "").toUpperCase()}
          </span>
          <span
            style={{
              fontFamily: fontStacks.mono,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: disabled ? T.textMute : "#000",
              background: disabled ? "transparent" : T.lime,
              border: `1px solid ${disabled ? T.line : T.lime}`,
              padding: "0 4px",
              flexShrink: 0,
            }}
          >
            {disabled ? "CLOSED" : "OPEN"}
          </span>
        </Box>

        <Box
          sx={{
            aspectRatio: "1 / 1",
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={imgFile}
            alt={altTitle}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              opacity: disabled ? 0.35 : 1,
            }}
            loading="lazy"
          />
        </Box>
      </Box>
    </Tooltip>
  );
};

export default GamesTile;
