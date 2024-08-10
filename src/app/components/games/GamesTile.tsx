import { Box, Paper, Tooltip } from "@mui/material";

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
      <Paper
        className="mr-2 mt-2 md:mr-8 md:mt-8"
        elevation={3}
        sx={{
          maxWidth: 500,
          aspectRatio: "1 / 1", // Maintain square aspect ratio
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.5 : 1,
          position: "relative",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          overflow: "visible", // Ensure border effect is visible
          "&:hover": {
            transform: disabled ? "none" : "scale(1.05)",
            boxShadow: disabled ? "none" : "0px 4px 20px rgba(0, 0, 0, 0.9)",
          },
          "&:hover::before": {
            opacity: disabled ? 0 : 1,
            transform: "scale(1.2)",
            boxShadow: `0 0 20px rgba(63, 81, 181, 0.9)`, // Increased glow on hover
          },
        }}
        onClick={!disabled ? onClick : undefined}
      >
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            className="w-60 md:w-96 lg:w-full"
            src={imgFile}
            alt={altTitle}
            style={{
              objectFit: "contain",
              filter: `saturate(${disabled ? "20%" : "100%"})`,
            }}
            loading="lazy"
          />
        </Box>
      </Paper>
    </Tooltip>
  );
};

export default GamesTile;
