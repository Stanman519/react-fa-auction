// Parses and styles the pipe-delimited MFL `contractStatus` tag string
// (e.g. "R1-2024|HOLDOUT") shared by the roster page and transaction tabs.

export interface ParsedTag {
  raw: string;
  label: string;
  color: string;
  isHoldout: boolean;
}

const ROOKIE_COLOR = "#3fa7a0"; // teal — original rookie-scale deal
export const FIFTH_YEAR_OPTION_COLOR = "#b98add"; // lavender — option exercised (or projected)
const FRANCHISE_TAG_COLOR = "#d98a2b"; // orange — franchise tagged
const WAIVER_EXT_COLOR = "#c9a227"; // gold — waiver extension
const HOLDOUT_COLOR = "#e2574a"; // red — actively holding out, can't be started

export const parseContractStatusTags = (contractStatus?: string | null): ParsedTag[] => {
  if (!contractStatus) return [];
  return contractStatus
    .split("|")
    .map((raw) => raw.trim())
    .filter(Boolean)
    .map((raw) => {
      if (raw === "HOLDOUT") {
        return { raw, label: "HOLDOUT", color: HOLDOUT_COLOR, isHoldout: true };
      }
      if (raw === "5YO") {
        return { raw, label: "5th YR OPT", color: FIFTH_YEAR_OPTION_COLOR, isHoldout: false };
      }
      if (raw === "WVR-EXT") {
        return { raw, label: "WAIVER EXT", color: WAIVER_EXT_COLOR, isHoldout: false };
      }
      if (/^TAG-\d+$/.test(raw)) {
        return { raw, label: raw.replace("TAG-", "TAG "), color: FRANCHISE_TAG_COLOR, isHoldout: false };
      }
      if (/^R\d+-\d{4}$/.test(raw)) {
        return { raw, label: raw, color: ROOKIE_COLOR, isHoldout: false };
      }
      return { raw, label: raw, color: "#666", isHoldout: false };
    });
};

// Plain-text form for contexts that can't render the styled badge component
// (e.g. a MUI checkbox label) — e.g. "R1-2023, HOLDOUT" or "R1-2023, OPT $31?".
export const contractStatusSuffixText = (
  contractStatus?: string | null,
  projectedFifthYearOptionSalary?: number | null,
): string => {
  const labels = parseContractStatusTags(contractStatus).map((t) => t.label);
  if (projectedFifthYearOptionSalary) labels.push(`OPT $${projectedFifthYearOptionSalary}?`);
  return labels.length === 0 ? "" : ` — ${labels.join(", ")}`;
};
