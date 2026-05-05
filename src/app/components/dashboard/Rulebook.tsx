import { useState } from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { terminal, fontStacks } from "../../../theme";
import { ASubHeader } from "../nonAuction/terminal";

interface Section {
  id: string;
  title: string;
  body: Array<string | { bullets: string[] }>;
}

const SECTIONS: Section[] = [
  {
    id: "rosters",
    title: "Roster & Salary Cap",
    body: [
      "Active Rosters comprise 25 spots plus two IR spots. Each team must carry at least 20 active players before the season starts.",
      "The total salary cap is $500. A spending floor is enforced during the season: teams cannot have more than $200 in available cap space.",
      {
        bullets: [
          "Standard cut penalty: 40% of remaining contract value (rounded up) for each year remaining.",
          "IR Relief: Only 50% of a player's salary counts against the cap while in an IR spot.",
          "Cap exceptions: Players may be cut without penalty if they retire, die, or are placed on indefinite NFL suspension.",
        ],
      },
    ],
  },
  {
    id: "contracts",
    title: "Contract Years",
    body: [
      "Active rosters must maintain between 35 and 75 total contract years. These limits are lifted during the off-season.",
      "Individual players must have a contract between 1 and 5 years.",
    ],
  },
  {
    id: "taxi",
    title: "Taxi Squad",
    body: [
      "Max 5 players per team. Only rookies are eligible to be added, but they may remain on the taxi squad after their rookie year.",
      {
        bullets: [
          "Taxi players count only 20% toward the cap and do not count toward the 35–75 team contract-year limit.",
          "The contract clock continues to run while a player is on the taxi squad.",
          "Graduation: Once a player is on an active roster for one game, they are no longer taxi squad eligible.",
          "Owners cannot claim players off another team’s taxi squad.",
        ],
      },
    ],
  },
  {
    id: "rookie-draft",
    title: "Rookie Draft",
    body: [
      "Consists of 4 rounds with salaries and years determined by draft slot. The draft order is the inverse of the prior year's standings.",
      {
        bullets: [
          "RB Multiplier: Players eligible at RB during their rookie year have a 1.2x multiplier applied to their rookie contract salary.",
          "5th Year Option: Owners of 1st round picks can extend the contract to a 5th year at the original value plus a 30% increase.",
        ],
      },
    ],
  },
  {
    id: "waivers",
    title: "Waivers & Extensions",
    body: [
      "In-season free agents are awarded via blind bid. These players receive a 1-year contract for the winning bid amount.",
      "Once per offseason, a team can extend one player acquired via waivers the previous season. The extension is 1 year at $25 and is only available for non-QBs.",
    ],
  },
  {
    id: "tags",
    title: "Franchise Tags",
    body: [
      "Applied to players with expired contracts. One tag per team per season; max 2 consecutive and 3 career tags per player.",
      {
        bullets: [
          "1st Tag: One year at the greater of: average top-6 salaries at the position OR a 20% raise.",
          "2nd Tag: One year at the greater of: average top-3 salaries at the position OR a 20% raise.",
        ],
      },
    ],
  },
  {
    id: "amnesty",
    title: "Offseason Amnesty",
    body: [
      "Early in the offseason, teams may use a one-time Amnesty Buyout for a $15 fee. The dead cap hit is reduced to 20% and applies only to the following season.",
      "During the same window, players may be cut from the taxi squad with zero dead cap penalty.",
    ],
  },
  {
    id: "holdouts",
    title: "Holdouts",
    body: [
      "Drawn after the Super Bowl. Only one player per team can hold out per year (the eligible player with the highest potential raise).",
      "A holdout demands a 20% raise, with the increase capped between $3 and $10.",
      "If the raise is unpaid, the player stays rostered and counts against the cap, but cannot be started until Week 9.",
      {
        bullets: [
          "Eligibility: QB1s, RB1s/2s, and WR1s/2s/3s who are paid less than the median salary of the tier below them (e.g., a WR1 paid less than the WR2 median).",
        ],
      },
    ],
  },
  {
    id: "auction",
    title: "Free Agency Auction",
    body: [
      "Qualifying bids are determined by the formula: (Years × 5) + Annual Salary.",
      {
        bullets: [
          "$1 bids: Must be 1-year contracts.",
          "$2–$19: Max 2-year contracts.",
          "Under $35: Max 3-year contracts.",
          "$35 or more: Up to 5-year contracts.",
        ],
      },
    ],
  },
  {
    id: "penalties",
    title: "League Penalties",
    body: [
      "Roster Compliance: Being over the cap or outside roster size limits results in a $5 weekly fine and a locked lineup.",
      "Lineup Compliance: Starting a player who is OUT, on IR, or on a BYE (if alternatives exist) results in a $5 fine.",
    ],
  },
];

const label = {
  fontFamily: fontStacks.mono,
  fontSize: 10,
  color: terminal.textMute,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
};

const renderBody = (body: Section["body"]) =>
  body.map((b, i) => {
    if (typeof b === "string") {
      return (
        <Box
          key={i}
          sx={{
            fontFamily: fontStacks.sans,
            fontSize: 14,
            color: terminal.text,
            lineHeight: 1.6,
            mb: 1.25,
          }}
        >
          {b}
        </Box>
      );
    }
    return (
      <Box key={i} component="ul" sx={{ pl: 2.5, mb: 1.5 }}>
        {b.bullets.map((bullet, j) => (
          <Box
            key={j}
            component="li"
            sx={{
              fontFamily: fontStacks.sans,
              fontSize: 14,
              color: terminal.textDim,
              lineHeight: 1.6,
              mb: 0.5,
            }}
          >
            {bullet}
          </Box>
        ))}
      </Box>
    );
  });

export const Rulebook = () => {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("md"));
  const [active, setActive] = useState<string | null>(null);

  const scrollTo = (id: string) => {
    const el = document.getElementById(`rule-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActive(id);
    }
  };

  // Mobile drilldown: TOC list view → tap rule → full-screen sheet
  if (mobile) {
    const activeSection = SECTIONS.find((s) => s.id === active);
    if (activeSection) {
      return (
        <Box
          sx={{
            background: terminal.bg,
            color: terminal.text,
            display: "flex",
            flexDirection: "column",
            minHeight: "100%",
          }}
        >
          <ASubHeader
            title={activeSection.title}
            sub="LEAGUE CONSTITUTION"
            onBack={() => setActive(null)}
          />
          <Box sx={{ p: 2 }}>{renderBody(activeSection.body)}</Box>
        </Box>
      );
    }
    return (
      <Box sx={{ background: terminal.bg, color: terminal.text }}>
        <Box sx={{ p: 2 }}>
          <Box sx={label}>Rulebook</Box>
          <Box
            sx={{
              fontFamily: fontStacks.sans,
              fontSize: 18,
              fontWeight: 700,
              color: terminal.text,
            }}
          >
            League Constitution
          </Box>
        </Box>
        <Box
          sx={{
            background: terminal.panel,
            borderTop: `1px solid ${terminal.line}`,
            borderBottom: `1px solid ${terminal.line}`,
          }}
        >
          {SECTIONS.map((s) => (
            <Box
              key={s.id}
              onClick={() => setActive(s.id)}
              sx={{
                px: 2,
                py: 1.5,
                borderBottom: `1px solid ${terminal.line}`,
                "&:last-child": { borderBottom: "none" },
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
              }}
            >
              <Box
                sx={{
                  fontFamily: fontStacks.sans,
                  fontSize: 14,
                  fontWeight: 600,
                  color: terminal.text,
                }}
              >
                {s.title}
              </Box>
              <Box
                component="span"
                sx={{
                  fontFamily: fontStacks.mono,
                  fontSize: 16,
                  color: terminal.textDim,
                }}
              >
                ›
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ background: terminal.bg, color: terminal.text, p: 2 }}>
      <Box sx={{ mb: 2 }}>
        <Box sx={label}>Rulebook</Box>
        <Box
          sx={{
            fontFamily: fontStacks.sans,
            fontSize: 18,
            fontWeight: 700,
            color: terminal.text,
          }}
        >
          League Constitution
        </Box>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: mobile ? "1fr" : "200px 1fr",
          gap: 2,
        }}
      >
        {/* TOC */}
        <Box
          sx={{
            background: terminal.panel,
            border: `1px solid ${terminal.line}`,
            borderRadius: "3px",
            p: 1,
            position: mobile ? "static" : "sticky",
            top: 80,
            alignSelf: "start",
            maxHeight: mobile ? "none" : "calc(100vh - 120px)",
            overflowY: "auto",
          }}
        >
          <Box sx={{ ...label, px: 1, py: 0.75 }}>Contents</Box>
          {SECTIONS.map((s) => (
            <Box
              key={s.id}
              onClick={() => scrollTo(s.id)}
              sx={{
                px: 1,
                py: 0.75,
                fontFamily: fontStacks.mono,
                fontSize: 11,
                color: active === s.id ? terminal.lime : terminal.textDim,
                borderLeft: `2px solid ${
                  active === s.id ? terminal.lime : "transparent"
                }`,
                cursor: "pointer",
                "&:hover": {
                  color: terminal.text,
                  background: terminal.panel2,
                },
              }}
            >
              {s.title}
            </Box>
          ))}
        </Box>

        {/* Content */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {SECTIONS.map((s) => (
            <Box
              key={s.id}
              id={`rule-${s.id}`}
              sx={{
                background: terminal.panel,
                border: `1px solid ${terminal.line}`,
                borderRadius: "3px",
                p: 2,
                scrollMarginTop: 80,
              }}
            >
              <Box
                sx={{
                  fontFamily: fontStacks.mono,
                  fontSize: 11,
                  color: terminal.lime,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  mb: 1.25,
                }}
              >
                {s.title}
              </Box>
              {renderBody(s.body)}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default Rulebook;
