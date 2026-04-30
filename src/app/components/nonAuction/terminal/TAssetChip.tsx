import { Box } from "@mui/material";
import { A, dfs } from "./tokens";
import TPosBadge from "./TPosBadge";

export type AssetKind = "player" | "pick" | "cap";

export interface TAsset {
  kind: AssetKind;
  name: string;
  pos?: string;
  team?: string;
  apy?: number;
  years?: number;
  note?: string;
}

export default function TAssetChip({ asset, mobile }: { asset: TAsset; mobile?: boolean }) {
  const isPlayer = asset.kind === "player";
  const isPick = asset.kind === "pick";
  const tone = isPlayer ? A.text : isPick ? A.amber : A.lime;
  const label = isPlayer ? asset.pos ?? "POS" : isPick ? "PICK" : "CAP";
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 10px",
        background: A.panel2,
        border: `1px solid ${A.line}`,
        borderRadius: "2px",
      }}
    >
      <TPosBadge pos={label} color={tone} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box
          sx={{
            fontSize: mobile ? 12 : dfs(13),
            fontWeight: 600,
            color: A.text,
            lineHeight: 1.2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {asset.name}
        </Box>
        {isPlayer && asset.team && (
          <Box sx={{ fontSize: dfs(10), color: A.textDim, fontFamily: A.mono }}>
            {asset.team}
            {asset.apy != null && ` · $${asset.apy}M`}
            {asset.years != null && ` × ${asset.years}YR`}
          </Box>
        )}
        {!isPlayer && asset.note && (
          <Box sx={{ fontSize: dfs(10), color: A.textDim, fontFamily: A.mono }}>{asset.note}</Box>
        )}
      </Box>
    </Box>
  );
}
