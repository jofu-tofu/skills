#!/usr/bin/env bun
/**
 * MeasureDraft.ts
 *
 * Mechanical measurements that ClarityEngine's lens reviewers use as evidence:
 * main-path reading time against a budget (RC-19), headings with their first
 * sentences and paragraph openings (RC-5, RC-6), emphasized spans (RC-10), the
 * first half of the main path (RC-9), the skim layer of headings and bold text
 * (RC-10), and, with --before, sentences that lost a
 * connective between drafts (RC-25).
 *
 * The main path is everything outside <details> blocks and appendix sections.
 *
 * Usage:
 *   bun MeasureDraft.ts <draft.md|.html|.txt> [--budget <minutes>] [--before <previous draft>] [--out <dir>]
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { extname, join, resolve } from "path";

const WORDS_PER_MINUTE = 220;
const FAST_WORDS_PER_MINUTE = 240;
const SLOW_WORDS_PER_MINUTE = 200;
const CONNECTIVE_PATTERN =
  /\b(because|so that|so|therefore|unless|which means|as a result|but|since|thus|hence|consequently|otherwise)\b/i;
const MIN_SIMILARITY_FOR_REWRITE = 0.5;
// Placeholders survive the tag-stripping pass in htmlToMarkdown, then become <details> lines again.
const DETAILS_OPEN_MARKER = "@@CLARITY_DETAILS_OPEN@@";
const DETAILS_CLOSE_MARKER = "@@CLARITY_DETAILS_CLOSE@@";

type BlockKind = "heading" | "paragraph" | "item" | "table";

interface DraftBlock {
  kind: BlockKind;
  headingLevel: number;
  text: string;
  sectionHeading: string;
  onMainPath: boolean;
  emphasizedSpans: string[];
}

interface CliOptions {
  draftPath: string;
  budgetMinutes?: number;
  beforePath?: string;
  outDir?: string;
}

function parseArgs(argv: string[]): CliOptions {
  const usage =
    "Usage: bun MeasureDraft.ts <draft.md|.html|.txt> [--budget <minutes>] [--before <previous draft>] [--out <dir>]";
  const positional: string[] = [];
  const options: Partial<CliOptions> = {};
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    if (arg === "--budget") options.budgetMinutes = Number(argv[++index]);
    else if (arg === "--before") options.beforePath = argv[++index];
    else if (arg === "--out") options.outDir = argv[++index];
    else if (arg === "--help" || arg === "-h") {
      console.log(usage);
      process.exit(0);
    } else positional.push(arg);
  }
  if (positional.length !== 1) {
    console.error(usage);
    process.exit(1);
  }
  if (options.budgetMinutes !== undefined && !(options.budgetMinutes > 0)) {
    console.error("--budget must be a positive number of minutes");
    process.exit(1);
  }
  return { ...options, draftPath: positional[0] } as CliOptions;
}

function readDraft(path: string): string {
  const resolvedPath = resolve(path);
  if (!existsSync(resolvedPath)) {
    console.error(`File not found: ${resolvedPath}`);
    process.exit(1);
  }
  const raw = readFileSync(resolvedPath, "utf8");
  return [".html", ".htm"].includes(extname(resolvedPath).toLowerCase()) ? htmlToMarkdown(raw) : raw;
}

function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

// Converts HTML to the Markdown subset parseBlocks understands, keeping
// <details> boundaries on their own lines so collapsed content stays off the main path.
function htmlToMarkdown(html: string): string {
  let text = html
    .replace(/<head[\s\S]*?<\/head>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<pre[\s\S]*?<\/pre>/gi, "\n\n")
    .replace(/<!--[\s\S]*?-->/g, "");
  text = text
    .replace(/<details[^>]*>/gi, `\n\n${DETAILS_OPEN_MARKER}\n\n`)
    .replace(/<\/details>/gi, `\n\n${DETAILS_CLOSE_MARKER}\n\n`)
    .replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_match, level, inner) => {
      const headingText = inner.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
      return `\n\n${"#".repeat(Number(level))} ${headingText}\n\n`;
    })
    .replace(/<(strong|b|mark)\b[^>]*>/gi, "**")
    .replace(/<\/(strong|b|mark)>/gi, "**")
    .replace(/<li[^>]*>/gi, "\n- ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<tr[^>]*>/gi, "\n|")
    .replace(/<\/t[dh]>/gi, " |")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?(p|div|section|article|aside|blockquote|ul|ol|table|tbody|thead|summary|header|footer|main|nav)\b[^>]*>/gi, "\n\n")
    .replace(/<[^>]+>/g, "");
  return decodeEntities(text).split(DETAILS_OPEN_MARKER).join("<details>").split(DETAILS_CLOSE_MARKER).join("</details>");
}

function stripInlineMarkdown(text: string): string {
  return text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\*\*|__/g, "")
    .replace(/(^|\s)[*_]([^*_]+)[*_](?=\s|[.,;:!?]|$)/g, "$1$2")
    .replace(/\s+/g, " ")
    .trim();
}

function findEmphasizedSpans(rawText: string): string[] {
  const spans: string[] = [];
  // Hide inline code behind placeholders so markers inside code don't count as bold, then put the code text back.
  const inlineCodeTexts: string[] = [];
  const textWithCodePlaceholders = rawText.replace(/`([^`]*)`/g, (_whole, codeText: string) => `\u0000${inlineCodeTexts.push(codeText) - 1}\u0000`);
  const restoreInlineCode = (text: string) => text.replace(/\u0000(\d+)\u0000/g, (_whole, codeIndex: string) => inlineCodeTexts[Number(codeIndex)]);
  for (const match of textWithCodePlaceholders.matchAll(/\*\*([^*]+)\*\*|__([^_]+)__|<mark>([\s\S]*?)<\/mark>/g)) {
    const spanText = restoreInlineCode(stripInlineMarkdown(match[1] ?? match[2] ?? match[3] ?? ""));
    if (spanText) spans.push(spanText);
  }
  return spans;
}

function parseBlocks(markdown: string): DraftBlock[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: DraftBlock[] = [];
  let collapsedDepth = 0;
  let appendixLevel = 0;
  let currentSectionHeading = "(document start)";
  let insideCodeFence = false;
  let pendingParagraphLines: string[] = [];
  let lineIndex = 0;

  if (lines[0]?.trim() === "---") {
    const frontMatterEnd = lines.findIndex((line, index) => index > 0 && line.trim() === "---");
    if (frontMatterEnd > 0) lineIndex = frontMatterEnd + 1;
  }

  const isOnMainPath = () => collapsedDepth === 0 && appendixLevel === 0;
  const pushBlock = (kind: BlockKind, rawText: string, headingLevel = 0) => {
    const text = stripInlineMarkdown(rawText);
    if (!text) return;
    blocks.push({
      kind,
      headingLevel,
      text,
      sectionHeading: currentSectionHeading,
      onMainPath: isOnMainPath(),
      emphasizedSpans: kind === "heading" ? [] : findEmphasizedSpans(rawText),
    });
  };
  const flushParagraph = () => {
    if (pendingParagraphLines.length > 0) pushBlock("paragraph", pendingParagraphLines.join(" "));
    pendingParagraphLines = [];
  };

  for (; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    const trimmed = line.trim();

    if (/^(```|~~~)/.test(trimmed)) {
      flushParagraph();
      insideCodeFence = !insideCodeFence;
      continue;
    }
    if (insideCodeFence) continue;

    if (/<details\b/i.test(trimmed) || /<\/details>/i.test(trimmed)) {
      flushParagraph();
      collapsedDepth += (trimmed.match(/<details\b/gi) ?? []).length;
      collapsedDepth = Math.max(0, collapsedDepth - (trimmed.match(/<\/details>/gi) ?? []).length);
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      const headingLevel = headingMatch[1].length;
      if (appendixLevel > 0 && headingLevel <= appendixLevel) appendixLevel = 0;
      const headingText = stripInlineMarkdown(headingMatch[2]);
      if (/\bappendix\b/i.test(headingText)) appendixLevel = headingLevel;
      currentSectionHeading = headingText;
      pushBlock("heading", headingText, headingLevel);
      continue;
    }

    if (trimmed === "") {
      flushParagraph();
      continue;
    }

    if (/^\|.*\|$/.test(trimmed)) {
      flushParagraph();
      if (!/^\|[\s:|-]+\|$/.test(trimmed)) pushBlock("table", trimmed.replace(/\|/g, " "));
      continue;
    }

    const listItemMatch = trimmed.match(/^([-*+]|\d+[.)])\s+(.*)$/);
    if (listItemMatch) {
      flushParagraph();
      pushBlock("item", listItemMatch[2]);
      continue;
    }

    pendingParagraphLines.push(trimmed.replace(/^>\s?/, ""));
  }
  flushParagraph();
  return blocks;
}

function countWords(text: string): number {
  return text.split(/\s+/).filter((token) => /[\p{L}\p{N}]/u.test(token)).length;
}

function splitSentences(text: string): string[] {
  const sentenceMatches: string[] = text.match(/[^.!?]+(?:[.!?]+["')\]]*(?=\s|$)|$)/g) ?? [];
  return sentenceMatches
    .map((sentence) => sentence.trim())
    .filter((sentence) => countWords(sentence) > 0);
}

function escapeCell(text: string): string {
  return text.replace(/\|/g, "\\|");
}

function normalizeSentence(sentence: string): string {
  return sentence.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, "").replace(/\s+/g, " ").trim();
}

function contentWordSet(sentence: string): Set<string> {
  return new Set(normalizeSentence(sentence).split(" ").filter((word) => word.length > 3));
}

function jaccardSimilarity(first: Set<string>, second: Set<string>): number {
  if (first.size === 0 || second.size === 0) return 0;
  let shared = 0;
  for (const word of first) if (second.has(word)) shared++;
  return shared / (first.size + second.size - shared);
}

function describeReadingTime(mainPathWords: number, collapsedWords: number, budgetMinutes?: number): string {
  const minutes = mainPathWords / WORDS_PER_MINUTE;
  const fastMinutes = mainPathWords / FAST_WORDS_PER_MINUTE;
  const slowMinutes = mainPathWords / SLOW_WORDS_PER_MINUTE;
  let budgetCell = "not set";
  let statusCell = "no budget given";
  if (budgetMinutes !== undefined) {
    budgetCell = `${budgetMinutes} min (${Math.round(budgetMinutes * WORDS_PER_MINUTE)} words)`;
    const overByPercent = Math.round((minutes / budgetMinutes - 1) * 100);
    statusCell = overByPercent > 0 ? `over budget by ${overByPercent}%` : "within budget";
  }
  return [
    "## Reading Time (RC-19)",
    "",
    `| Main-path words | Minutes at ${WORDS_PER_MINUTE} wpm | Range (${FAST_WORDS_PER_MINUTE}–${SLOW_WORDS_PER_MINUTE} wpm) | Budget | Status |`,
    "|---|---|---|---|---|",
    `| ${mainPathWords} | ${minutes.toFixed(1)} | ${fastMinutes.toFixed(1)}–${slowMinutes.toFixed(1)} | ${budgetCell} | ${statusCell} |`,
    "",
    `Collapsed or appendix words, not counted: ${collapsedWords}.`,
  ].join("\n");
}

function describeHeadings(blocks: DraftBlock[]): string {
  const rows: string[] = [];
  blocks.forEach((block, index) => {
    if (block.kind !== "heading") return;
    const nextBlock = blocks.slice(index + 1).find((candidate) => candidate.kind !== "table");
    const firstSentence =
      nextBlock && nextBlock.kind !== "heading" ? splitSentences(nextBlock.text)[0] ?? "" : "(no text before next heading)";
    const pathNote = block.onMainPath ? "" : " (off main path)";
    rows.push(`| H${block.headingLevel} | ${escapeCell(block.text)}${pathNote} | ${escapeCell(firstSentence)} |`);
  });
  return ["## Headings and First Sentences (RC-5, RC-6)", "", "| Level | Heading | First sentence |", "|---|---|---|", ...rows].join("\n");
}

function describeParagraphOpenings(blocks: DraftBlock[]): string {
  const rows = blocks
    .filter((block) => block.kind === "paragraph" && block.onMainPath)
    .map((block, index) => `| ${index + 1} | ${escapeCell(block.sectionHeading)} | ${escapeCell(splitSentences(block.text)[0] ?? "")} |`);
  return ["## Paragraph Openings on the Main Path (RC-5)", "", "| # | Section | First sentence |", "|---|---|---|", ...rows].join("\n");
}

function describeEmphasis(blocks: DraftBlock[]): string {
  const rows: string[] = [];
  for (const block of blocks) {
    for (const span of block.emphasizedSpans) rows.push(`| ${rows.length + 1} | ${escapeCell(block.sectionHeading)} | ${escapeCell(span)} |`);
  }
  if (rows.length === 0) return "## Emphasized Spans (RC-10)\n\nNone found.";

  const densityBySection = new Map<string, { boldWords: number; totalWords: number; maxSpansInBlock: number }>();
  for (const block of blocks) {
    if (block.kind === "heading" || !block.onMainPath) continue;
    const density = densityBySection.get(block.sectionHeading) ?? { boldWords: 0, totalWords: 0, maxSpansInBlock: 0 };
    density.totalWords += countWords(block.text);
    density.boldWords += block.emphasizedSpans.reduce((sum, span) => sum + countWords(span), 0);
    density.maxSpansInBlock = Math.max(density.maxSpansInBlock, block.emphasizedSpans.length);
    densityBySection.set(block.sectionHeading, density);
  }
  const densityRows = [...densityBySection]
    .filter(([, density]) => density.boldWords > 0)
    .map(([section, density]) => {
      const boldPercent = Math.round((density.boldWords / Math.max(density.totalWords, 1)) * 100);
      return `| ${escapeCell(section)} | ${boldPercent}% | ${density.maxSpansInBlock} |`;
    });
  return [
    "## Emphasized Spans (RC-10)",
    "",
    "| # | Section | Text |",
    "|---|---|---|",
    ...rows,
    "",
    "Bold density on the main path:",
    "",
    "| Section | Bold words | Most spans in one paragraph |",
    "|---|---|---|",
    ...densityRows,
  ].join("\n");
}

// The skim layer is what a reader who reads only headings and bold text sees, in order.
function buildSkimLayer(blocks: DraftBlock[]): string {
  const lines: string[] = [];
  for (const block of blocks) {
    if (!block.onMainPath) continue;
    if (block.kind === "heading") lines.push("", `${"#".repeat(block.headingLevel)} ${block.text}`, "");
    else for (const span of block.emphasizedSpans) lines.push(`- ${span}`);
  }
  return lines.join("\n").trim() + "\n";
}

function buildFirstHalf(blocks: DraftBlock[], mainPathWords: number): { markdown: string; words: number; lastSection: string } {
  const halfWordTarget = Math.ceil(mainPathWords / 2);
  const lines: string[] = [];
  let wordsSoFar = 0;
  let lastSection = "(document start)";
  for (const block of blocks) {
    if (!block.onMainPath || wordsSoFar >= halfWordTarget) continue;
    if (block.kind === "heading") {
      lines.push(`${"#".repeat(block.headingLevel)} ${block.text}`, "");
      lastSection = block.text;
      continue;
    }
    const blockWords = block.text.split(/\s+/);
    const remainingWords = halfWordTarget - wordsSoFar;
    const keptText = countWords(block.text) > remainingWords ? `${blockWords.slice(0, remainingWords).join(" ")} […]` : block.text;
    lines.push(block.kind === "item" ? `- ${keptText}` : keptText, "");
    wordsSoFar += Math.min(countWords(block.text), remainingWords);
  }
  return { markdown: lines.join("\n").trim() + "\n", words: wordsSoFar, lastSection };
}

function describeConnectiveChanges(beforeBlocks: DraftBlock[], afterBlocks: DraftBlock[]): string {
  const afterSentences = afterBlocks.filter((block) => block.kind !== "heading").flatMap((block) => splitSentences(block.text));
  const afterNormalized = new Set(afterSentences.map(normalizeSentence));
  const afterWordSets = afterSentences.map((sentence) => ({ sentence, words: contentWordSet(sentence) }));
  const rows: string[] = [];

  for (const block of beforeBlocks) {
    if (block.kind === "heading") continue;
    for (const beforeSentence of splitSentences(block.text)) {
      if (!CONNECTIVE_PATTERN.test(beforeSentence) || afterNormalized.has(normalizeSentence(beforeSentence))) continue;
      const beforeWords = contentWordSet(beforeSentence);
      let closestSentence = "";
      let closestSimilarity = 0;
      for (const candidate of afterWordSets) {
        const similarity = jaccardSimilarity(beforeWords, candidate.words);
        if (similarity > closestSimilarity) {
          closestSimilarity = similarity;
          closestSentence = candidate.sentence;
        }
      }
      const isRewrite = closestSimilarity >= MIN_SIMILARITY_FOR_REWRITE;
      if (isRewrite && CONNECTIVE_PATTERN.test(closestSentence)) continue;
      const change = isRewrite ? "rewritten without a connective" : "deleted";
      rows.push(`| ${escapeCell(beforeSentence)} | ${change} | ${escapeCell(isRewrite ? closestSentence : "")} |`);
    }
  }
  if (rows.length === 0) return "## Connective Changes (RC-25)\n\nNo sentence lost a connective.";
  return [
    "## Connective Changes (RC-25)",
    "",
    "Each row needs its relation restored or stated nearby.",
    "",
    "| Before | Change | Closest sentence now |",
    "|---|---|---|",
    ...rows,
  ].join("\n");
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  const blocks = parseBlocks(readDraft(options.draftPath));
  const textBlocks = blocks.filter((block) => block.kind !== "heading");
  const mainPathWords = textBlocks.filter((block) => block.onMainPath).reduce((sum, block) => sum + countWords(block.text), 0);
  const collapsedWords = textBlocks.filter((block) => !block.onMainPath).reduce((sum, block) => sum + countWords(block.text), 0);
  const firstHalf = buildFirstHalf(blocks, mainPathWords);

  const sections = [
    "# Draft Measurements",
    `Source: ${resolve(options.draftPath)}\n\nMain path: everything outside <details> blocks and appendix sections.`,
    describeReadingTime(mainPathWords, collapsedWords, options.budgetMinutes),
    describeHeadings(blocks),
    describeParagraphOpenings(blocks),
    describeEmphasis(blocks),
    [
      "## First Half of the Main Path (RC-9)",
      "",
      `${firstHalf.words} words, ending in section "${firstHalf.lastSection}". ${options.outDir ? "Full text: first-half.md." : ""}`,
    ].join("\n"),
    `## Skim Layer (RC-10)\n\nHeadings and bold text in reading order. ${options.outDir ? "Full text: skim-layer.md." : ""}`,
  ];
  if (options.beforePath) sections.push(describeConnectiveChanges(parseBlocks(readDraft(options.beforePath)), blocks));
  const measurementsMarkdown = sections.join("\n\n") + "\n";

  if (!options.outDir) {
    console.log(measurementsMarkdown);
    console.log("---\n\n" + firstHalf.markdown);
    console.log("---\n\n" + buildSkimLayer(blocks));
    return;
  }
  const outDir = resolve(options.outDir);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "measurements.md"), measurementsMarkdown);
  writeFileSync(join(outDir, "first-half.md"), firstHalf.markdown);
  writeFileSync(join(outDir, "skim-layer.md"), buildSkimLayer(blocks));
  console.log(`Wrote measurements.md, first-half.md, and skim-layer.md to ${outDir}`);
}

main();
