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
    id: "cap",
    title: "Salary Cap",
    body: [
      "$500M total cap per roster. Every contract counts against the cap at its annual salary for each active year.",
      {
        bullets: [
          "Dead cap = 40% of remaining contract value per year dropped (standard cut).",
          "Roster must carry between 35 and 75 total contract-years across all players.",
        ],
      },
    ],
  },
  {
    id: "contracts",
    title: "Contracts",
    body: [
      "Players signed in free-agency auction receive a contract of 1–5 years at a flat annual salary.",
      "Contract length sets how many years the player's salary hits the cap. When the contract expires, the player becomes a free agent (or eligible for franchise tag).",
    ],
  },
  {
    id: "taxi",
    title: "Taxi Squad",
    body: [
      "Rookies only. Max 5 players on taxi at a time. Taxi players count 20% of their salary against the cap.",
      {
        bullets: [
          "Cut during the amnesty window: no dead cap charged.",
          "Promoted to active roster: full salary hits cap from that point forward.",
        ],
      },
    ],
  },
  {
    id: "waiver",
    title: "Waiver Extensions",
    body: [
      "Once per offseason, per team. A player picked up on waivers last season can be extended.",
      {
        bullets: [
          "Non-QBs only.",
          "1 year, $25M — flat.",
        ],
      },
    ],
  },
  {
    id: "tags",
    title: "Franchise Tags",
    body: [
      "Apply to players whose contract has just expired. One tag per team per season, max 2 consecutive and 3 career per player.",
      {
        bullets: [
          "1st tag price = max(average top-6 salaries at position, 20% raise over last salary).",
          "2nd tag price = max(average top-3 salaries at position, 20% raise).",
        ],
      },
    ],
  },
  {
    id: "amnesty",
    title: "Amnesty Buyouts",
    body: [
      "One buyout per team per season. $15 real-money buy-in.",
      "Dead cap = 20% of remaining value (next season only), vs the normal 40%. Cuts the player.",
    ],
  },
  {
    id: "holdouts",
    title: "Holdouts",
    body: [
      "Drawn post-Super-Bowl. Highest-raise candidate per team is flagged.",
      {
        bullets: [
          "20% raise demanded, capped between $3M and $10M.",
          "If unpaid: player stays rostered + cap-counts but cannot start until Week 9.",
        ],
      },
    ],
  },
  {
    id: "auction",
    title: "Free Agency Auction",
    body: [
      "Live, multi-user auction. Max 3 active nominations per owner at a time. Bids extend the lot timer to prevent sniping.",
      "Submitting a bid requires both salary and years-on-contract. New bids must beat the current bid on total value ($ × years).",
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
                color:
                  active === s.id ? terminal.lime : terminal.textDim,
                borderLeft: `2px solid ${
                  active === s.id ? terminal.lime : "transparent"
                }`,
                cursor: "pointer",
                "&:hover": { color: terminal.text, background: terminal.panel2 },
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
