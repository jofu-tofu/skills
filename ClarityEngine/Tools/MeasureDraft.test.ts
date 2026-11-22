import { describe, expect, test } from "bun:test";
import { parseBlocks, splitSentences } from "./MeasureDraft.ts";

describe("sentence extraction preserves prose before internal punctuation", () => {
  test("keeps the actual signed leading-decimal instruction intact", () => {
    const text = "Check that the credit adjustment is −.5 units, not .5.";
    expect(splitSentences(text)).toEqual([text]);
  });

  test("retains decimal and scientific values before a real sentence boundary", () => {
    expect(splitSentences("Use 1.5 units at 1.2e-3 seconds. Do not round them.")).toEqual([
      "Use 1.5 units at 1.2e-3 seconds.",
      "Do not round them.",
    ]);
  });

  test("retains version and URL prefixes, including an unfinished final sentence", () => {
    expect(splitSentences("Read v1.2.0 at https://example.test/a?x=1.5. Keep QueueStore.read intact")).toEqual([
      "Read v1.2.0 at https://example.test/a?x=1.5.",
      "Keep QueueStore.read intact",
    ]);
  });

  test("preserves ordinary boundaries and closing quote or bracket punctuation", () => {
    expect(splitSentences('Ready? Yes! She said "Wait." (Do not retry.) Continue')).toEqual([
      "Ready?", "Yes!", 'She said "Wait."', "(Do not retry.)", "Continue",
    ]);
  });

  test("actual Markdown prose extraction does not omit the negative quantity or instruction", () => {
    const blocks = parseBlocks("# Credit\n\nCheck that the credit adjustment is −.5 units, not .5. Keep the sign.\n");
    const prose = blocks.filter((block) => block.kind !== "heading").flatMap((block) => splitSentences(block.text));
    expect(prose).toEqual(["Check that the credit adjustment is −.5 units, not .5.", "Keep the sign."]);
  });
});

test("a fenced example cannot hide the release instruction that follows it", () => {
  const draft = ["# Procedure", "~~~~markdown", "~~~", "# Appendix", "Example only.", "~~~~", "Ship after approval."].join("\n");
  expect(parseBlocks(draft).filter(block => block.onMainPath).map(block => block.text)).toEqual(["Procedure", "Ship after approval."]);
});

test("nested appendix headings stay off the main path until the parent ends", () => {
  const draft = "## Appendix\n### Appendix A\n### Raw data\nPrivate notes.\n## Decision\nProceed.";
  expect(parseBlocks(draft).filter(block => block.onMainPath).map(block => block.text)).toEqual(["Decision", "Proceed."]);
});

test("a collapsed appendix cannot classify the visible decision as appendix material", () => {
  const draft = "# Instructions\n<details>\n## Appendix\nArchived notes.\n</details>\nRelease the signed report.";
  const visible = parseBlocks(draft).filter(block => block.onMainPath);
  expect(visible.map(block => block.text)).toEqual(["Instructions", "Release the signed report."]);
  expect(visible.at(-1)?.sectionHeading).toBe("Instructions");
});
