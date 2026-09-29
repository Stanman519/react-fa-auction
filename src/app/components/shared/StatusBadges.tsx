import { Box } from "@mui/material";
import { fontStacks } from "../../../theme";
import { FIFTH_YEAR_OPTION_COLOR, parseContractStatusTags } from "../../constants/contractStatusTags";

interface StatusBadgesProps {
  contractStatus?: string;
  // Set only for round-1 rookies who haven't had their option exercised yet — renders an
  // extra speculative badge (italic, "OPT $X?") distinct from a real, signed tag.
  projectedFifthYearOptionSalary?: number;
}

// Renders a player's contractStatus tags (rookie deal, 5th-year option, franchise tag,
// waiver extension, holdout) as small colored badges. Shared between the roster page and
// the trade screens so a player's contract situation reads the same everywhere.
export const StatusBadges = ({ contractStatus, projectedFifthYearOptionSalary }: StatusBadgesProps) => {
  const tags = parseContractStatusTags(contractStatus);
  if (tags.length === 0 && !projectedFifthYearOptionSalary) return null;
  return (
    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
      {tags.map((tag) => (
        <Box
          key={tag.raw}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            height: 15,
            px: 0.5,
            borderRadius: "2px",
            background: `${tag.color}26`,
            border: `1px solid ${tag.color}`,
            color: tag.color,
            fontWeight: 700,
            fontSize: 8,
            letterSpacing: "0.04em",
            fontFamily: fontStacks.mono,
            whiteSpace: "nowrap",
          }}
        >
          {tag.label}
        </Box>
      ))}
      {projectedFifthYearOptionSalary && (
        <Box
          title="Projected 5th-year option — not yet exercised"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            height: 15,
            px: 0.5,
            borderRadius: "2px",
            background: `${FIFTH_YEAR_OPTION_COLOR}26`,
            border: `1px dashed ${FIFTH_YEAR_OPTION_COLOR}`,
            color: FIFTH_YEAR_OPTION_COLOR,
            fontWeight: 700,
            fontStyle: "italic",
            fontSize: 8,
            letterSpacing: "0.04em",
            fontFamily: fontStacks.mono,
            whiteSpace: "nowrap",
          }}
        >
          OPT ${projectedFifthYearOptionSalary}?
        </Box>
      )}
    </Box>
  );
};
