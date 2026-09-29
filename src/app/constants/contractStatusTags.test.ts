import { parseContractStatusTags, contractStatusSuffixText } from "./contractStatusTags";

describe("parseContractStatusTags", () => {
  it("returns an empty array when there is no contractStatus", () => {
    expect(parseContractStatusTags(undefined)).toEqual([]);
    expect(parseContractStatusTags(null)).toEqual([]);
    expect(parseContractStatusTags("")).toEqual([]);
  });

  it("parses a single rookie-deal tag", () => {
    const tags = parseContractStatusTags("R1-2024");
    expect(tags).toHaveLength(1);
    expect(tags[0]).toMatchObject({ raw: "R1-2024", label: "R1-2024", isHoldout: false });
  });

  it("parses multiple pipe-delimited tags, flagging the holdout one", () => {
    const tags = parseContractStatusTags("R1-2024|HOLDOUT");
    expect(tags.map((t) => t.raw)).toEqual(["R1-2024", "HOLDOUT"]);
    expect(tags.find((t) => t.raw === "HOLDOUT")?.isHoldout).toBe(true);
    expect(tags.find((t) => t.raw === "R1-2024")?.isHoldout).toBe(false);
  });

  it("gives 5YO, TAG-n, and WVR-EXT distinct, non-clashing colors", () => {
    const tags = parseContractStatusTags("5YO|TAG-2|WVR-EXT");
    const colors = new Set(tags.map((t) => t.color));
    expect(colors.size).toBe(3);
  });

  it("falls back to raw text for an unrecognized tag rather than throwing", () => {
    const tags = parseContractStatusTags("SOMETHING-NEW");
    expect(tags).toEqual([{ raw: "SOMETHING-NEW", label: "SOMETHING-NEW", color: "#666", isHoldout: false }]);
  });
});

describe("contractStatusSuffixText", () => {
  it("returns an empty string when there is no contractStatus", () => {
    expect(contractStatusSuffixText(undefined)).toBe("");
    expect(contractStatusSuffixText(null)).toBe("");
    expect(contractStatusSuffixText("")).toBe("");
  });

  it("formats a single tag as a plain-text suffix", () => {
    expect(contractStatusSuffixText("R1-2023")).toBe(" — R1-2023");
  });

  it("joins multiple tags with a comma", () => {
    expect(contractStatusSuffixText("R1-2023|HOLDOUT")).toBe(" — R1-2023, HOLDOUT");
  });

  it("appends the projected 5th-year option when present", () => {
    expect(contractStatusSuffixText("R1-2023", 31)).toBe(" — R1-2023, OPT $31?");
  });

  it("shows the projection on its own when there's no contractStatus", () => {
    expect(contractStatusSuffixText(undefined, 31)).toBe(" — OPT $31?");
  });
});
