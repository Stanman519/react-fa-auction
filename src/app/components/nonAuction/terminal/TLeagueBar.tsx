import { Box } from "@mui/material";
import { A, dfs } from "./tokens";
import TLabel from "./TLabel";

interface TLeagueBarProps {
  leagueName: string;
  teamName?: string;
  stats?: Array<{
    label: string;
    value: React.ReactNode;
    tone?: "text" | "lime" | "red" | "amber";
  }>;
}

const valueTone = {
  text: A.text,
  lime: A.lime,
  red: A.red,
  amber: A.amber,
};

export default function TLeagueBar({
  leagueName,
  teamName,
  stats = [],
}: TLeagueBarProps) {
  return (
    <Box
      sx={{
        padding: { xs: "12px 14px", md: "14px 20px" },
        background: A.panel,
        borderBottom: `1px solid ${A.lineBold}`,
        display: "flex",
        alignItems: { xs: "flex-start", md: "center" },
        flexDirection: { xs: "column", md: "row" },
        gap: { xs: "10px", md: "20px" },
      }}
    >
      <Box>
        <TLabel size={9}>LEAGUE</TLabel>
        <Box
          sx={{
            fontSize: dfs(18),
            fontWeight: 700,
            color: A.text,
            fontFamily: A.sans,
            letterSpacing: "-0.01em",
            lineHeight: 1.2,
          }}
        >
          {leagueName}
        </Box>
        {teamName && (
          <Box
            sx={{
              fontSize: dfs(11),
              color: A.textDim,
              fontFamily: A.mono,
              mt: "2px",
            }}
          >
            {teamName}
          </Box>
        )}
      </Box>
      {stats.length > 0 && (
        <>
          <Box
            sx={{
              width: { xs: "100%", md: "1px" },
              height: { xs: "1px", md: "30px" },
              background: A.lineBold,
            }}
          />
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: "20px",
              fontFamily: A.mono,
              fontSize: dfs(11),
            }}
          >
            {stats.map((s, i) => (
              <Box key={`${s.label}-${i}`}>
                <TLabel>{s.label}</TLabel>
                <Box
                  sx={{
                    color: valueTone[s.tone ?? "text"],
                    fontSize: dfs(15),
                    fontWeight: 700,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {s.value}
                </Box>
              </Box>
            ))}
          </Box>
        </>
      )}
    </Box>
  );
}
