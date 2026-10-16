#!/usr/bin/env bun
/**
 * ScorePlainness.ts
 *
 * Deterministic plainness scoring for the PlainRewrite workflow. Two modes:
 *
 *   triage  Scores every prose sentence in a draft and lists the ones worth rewriting,
 *           as plainness.md for reviewers and plain-candidates.json for the rewriters.
 *   score   Takes plain-candidates.json after the rewriters fill in candidates, applies
 *           meaning-preservation gates to each candidate, ranks the ones that pass on each
 *           plainness signal, and decides: keep the original, pick a candidate, or merge.
 *
 * Signals and gates come from the research summarized in Workflows/PlainRewrite.md. Word
 * familiarity uses SUBTLEX-US Zipf frequencies (Tools/data/subtlex-zipf.json). Signals
 * that need part-of-speech tags use compromise; without it they are reported as not run.
 *
 * Usage:
 *   bun ScorePlainness.ts triage <draft.md|.html|.txt> [--required <term,term,...>] [--out <dir>]
 *   bun ScorePlainness.ts score <plain-candidates.json> [--out <dir>]
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, resolve } from "path";
import { parseBlocks, readDraft, splitSentences, countWords } from "./MeasureDraft.ts";

// ---------- Data ----------

interface ZipfData {
  unseenZipf: number;
  zipf: Record<string, number>;
}

const ZIPF_DATA: ZipfData = JSON.parse(readFileSync(join(import.meta.dir, "data", "subtlex-zipf.json"), "utf8"));

// compromise supplies part-of-speech tags for the subject-verb, passive, and noun-stack signals.
let compromiseNlp: ((text: string) => any) | null = null;
try {
  compromiseNlp = (await import("compromise")).default;
} catch {
  compromiseNlp = null;
}

// Below Zipf 3 a word is low frequency (van Heuven et al. 2014).
const RARE_WORD_ZIPF = 3;
const LONG_SENTENCE_WORDS = 25;
const TRIAGE_MAIN_VERB_DISTANCE = 7;
// One strong flag, or two weak ones, is worth three rewrites; a lone passive or noun stack is not.
const TRIAGE_MIN_PRIORITY = 2;
const MIN_CONTENT_LENGTH_RATIO = 0.6;
const MIN_CONTENT_OVERLAP = 0.3;
const MIN_CONTENT_WORDS_FOR_OVERLAP = 4;

const STOPWORDS = new Set(
  (
    "a an the and or but if then so because of in on at to for from by with without as is are was were be been being am " +
    "do does did done doing have has had having will would can could may might must shall should not no nor never it its this " +
    "that these those there here they them their theirs we us our ours you your yours he she him her his hers i me my mine who " +
    "whom whose which what when where why how all any each every some more most other others such only own same than too very " +
    "just also into onto over under about after before between through during until while again once up down out off both " +
    "either neither unless though although whether yet still even much many few less least s t get gets got let lets via per " +
    "instead whenever since however therefore thus hence"
  ).split(" "),
);

// Latin abbreviations look like dotted identifiers but are ordinary prose.
const PROSE_ABBREVIATIONS = new Set(["e.g", "i.e", "etc", "vs", "a.m", "p.m"]);

const ACRONYM_ALLOWLIST = new Set(["OK", "AM", "PM", "ID", "IDs", "PDF", "URL", "US", "USA", "UK", "TV", "FAQ", "CEO", "FAQs", "URLs", "PDFs"]);

const NUMBER_WORDS: Record<string, string> = {
  zero: "0", one: "1", two: "2", three: "3", four: "4", five: "5", six: "6", seven: "7", eight: "8", nine: "9", ten: "10",
  eleven: "11", twelve: "12", thirteen: "13", fourteen: "14", fifteen: "15", sixteen: "16", seventeen: "17", eighteen: "18",
  nineteen: "19", twenty: "20", thirty: "30", forty: "40", fifty: "50", sixty: "60", seventy: "70", eighty: "80", ninety: "90",
  hundred: "100", thousand: "1000",
};

// "unless" counts as both a condition and a negation, so "if ... not" can replace it.
const NEGATION_PATTERN = /\b(not|no|never|none|nothing|nobody|nowhere|neither|nor|without|cannot|unless)\b|n['’]t\b/gi;
// Verbs with a negative meaning. Each may count as a negation or not, so "excludes" can become
// "does not send" or "leaves out", but "is not told" cannot become "is told".
const NEGATIVE_VERB_PATTERN = /\b(exclud|omit|skip|lack|fail|prevent|stop|ignor|block|den[iy]|reject|refus|avoid|miss|forbid|prohibit)[a-z]*\b/gi;

// Each class must survive a rewrite. Classes marked strict also may not be added, because adding
// one narrows or widens what the sentence requires or allows.
const MEANING_CLASSES: { name: string; pattern: RegExp; strict: boolean }[] = [
  { name: "obligation (must)", pattern: /\b(must|shall|required to|requires?|has to|have to|needs?)\b/i, strict: true },
  { name: "permission (may/can)", pattern: /\b(may|might|can|could|cannot|can['’]t|able to|allowed to)\b/i, strict: false },
  { name: "recommendation (should)", pattern: /\b(should|recommend(s|ed)?)\b/i, strict: true },
  { name: "restriction (only)", pattern: /\b(only|solely|exclusively|alone|by itself|by themselves|on its own|on their own)\b/i, strict: true },
  { name: "universal (all/every)", pattern: /\b(all|every|each|always|any)\b/i, strict: true },
  { name: "limit (at least/at most)", pattern: /\b(at least|at most|no more than|no fewer than|up to|minimum|maximum)\b/i, strict: true },
  { name: "condition (if/unless/when)", pattern: /\b(if|unless|when|whenever|once|until|as long as|provided that)\b/i, strict: false },
  { name: "cause (because/so)", pattern: /\b(because|since|so|therefore|thus|hence|as a result|which means|so that|due to|causes?|leads? to)\b/i, strict: false },
  { name: "contrast (but/except)", pattern: /\b(but|however|although|though|yet|whereas|except|instead|while)\b/i, strict: false },
];

const SUBORDINATORS = new Set(["if", "when", "whenever", "because", "although", "though", "unless", "since", "after", "before", "once", "while", "until", "as"]);
const RELATIVE_MARKERS = new Set(["that", "which", "who", "whom", "whose", "where"]);

const VAGUE_VERB_PATTERN =
  /\b(leverag(e|es|ed|ing)|utiliz(e|es|ed|ing)|utilis(e|es|ed|ing)|facilitat(e|es|ed|ing)|ensur(e|es|ed|ing)|handl(e|es|ed|ing)|enabl(e|es|ed|ing)|optimiz(e|es|ed|ing))\b/gi;

const HIDDEN_VERB_PATTERNS = [
  /\b(the|a|an)\s+[a-z]+(tion|sion|ment|ance|ence|al|ysis)\s+of\b/gi,
  /\b(make|makes|made|making|perform|performs|performed|performing|conduct|conducts|conducted|provide|provides|provided|give|gives|gave|take|takes|took|carry out|carries out|carried out)\s+(a|an|the)?\s*[a-z]+(tion|sion|ment|ance|ence|al|ysis)\b/gi,
];

// ---------- Signals ----------

export type SignalName =
  | "rareWords"
  | "unexplainedTerms"
  | "mainVerbDistance"
  | "familiarity"
  | "agentlessPassives"
  | "nounStacks"
  | "hiddenVerbs"
  | "wordsOver25"
  | "vagueVerbs";

interface SignalSpec {
  name: SignalName;
  label: string;
  weight: number;
  higherIsBetter: boolean;
  needsTags: boolean;
  tieTolerance: number;
}

// Weights follow evidence strength: word frequency and unexplained abbreviations have the strongest
// comprehension evidence, subject-verb distance has good theory but only a tag-based proxy here, and
// the rest are plain-language guidance with weak or mixed evidence.
export const SIGNALS: SignalSpec[] = [
  { name: "rareWords", label: "Rare words", weight: 3, higherIsBetter: false, needsTags: false, tieTolerance: 0 },
  { name: "unexplainedTerms", label: "Unexplained terms", weight: 3, higherIsBetter: false, needsTags: false, tieTolerance: 0 },
  { name: "mainVerbDistance", label: "Words before main verb", weight: 2, higherIsBetter: false, needsTags: true, tieTolerance: 0 },
  { name: "familiarity", label: "Mean Zipf", weight: 2, higherIsBetter: true, needsTags: false, tieTolerance: 0.1 },
  { name: "agentlessPassives", label: "Agentless passives", weight: 1, higherIsBetter: false, needsTags: true, tieTolerance: 0 },
  { name: "nounStacks", label: "Noun stacks", weight: 1, higherIsBetter: false, needsTags: true, tieTolerance: 0 },
  { name: "hiddenVerbs", label: "Hidden verbs", weight: 1, higherIsBetter: false, needsTags: false, tieTolerance: 0 },
  { name: "wordsOver25", label: "Words over 25", weight: 1, higherIsBetter: false, needsTags: false, tieTolerance: 0 },
  { name: "vagueVerbs", label: "Vague verbs", weight: 1, higherIsBetter: false, needsTags: false, tieTolerance: 0 },
];
const TOP_TIER_WEIGHT = 3;

export type Signals = Record<SignalName, number | null> & { rareWordList: string[]; unexplainedTermList: string[] };

export interface TermContext {
  protectedTerms: string[];
  explainedTerms: string[];
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function tokenize(text: string): string[] {
  return text.match(/[A-Za-z][A-Za-z0-9'’_.\-]*[A-Za-z0-9]|[A-Za-z]|\d[\d,.]*%?/g) ?? [];
}

function isIdentifier(token: string): boolean {
  if (PROSE_ABBREVIATIONS.has(token.toLowerCase())) return false;
  return /[a-z][A-Z]/.test(token) || /_/.test(token) || /[A-Za-z]\.[A-Za-z]/.test(token) || /[A-Za-z]\d|\d[A-Za-z]/.test(token);
}

function isAcronym(token: string): boolean {
  return /^[A-Z][A-Z0-9]{1,}s?$/.test(token) && !ACRONYM_ALLOWLIST.has(token);
}

// Matches a term as a whole word. Abbreviations match case-sensitively so "TS" never matches inside "gets".
function termPattern(term: string, flags = ""): RegExp {
  const caseFlag = /[A-Z]{2}/.test(term) ? "" : "i";
  return new RegExp(`(?<![A-Za-z0-9])${escapeRegExp(term)}(?![A-Za-z0-9])`, caseFlag + flags);
}

function containsTerm(text: string, term: string): boolean {
  return termPattern(term).test(text);
}

// Hides protected terms so lexical signals skip them; gates still see the full text.
function maskProtected(text: string, protectedTerms: string[]): string {
  let masked = text;
  for (const term of [...protectedTerms].sort((first, second) => second.length - first.length)) {
    if (term.trim()) masked = masked.replace(termPattern(term, "g"), " ");
  }
  return masked;
}

function lookupZipf(word: string): number {
  const lower = word.toLowerCase().replace(/[’']s$/, "");
  const forms = [lower];
  if (lower.endsWith("ies")) forms.push(lower.slice(0, -3) + "y");
  if (lower.endsWith("es")) forms.push(lower.slice(0, -2));
  if (lower.endsWith("s")) forms.push(lower.slice(0, -1));
  if (lower.endsWith("ed")) forms.push(lower.slice(0, -2), lower.slice(0, -1), lower.slice(0, -3));
  if (lower.endsWith("ing")) forms.push(lower.slice(0, -3), lower.slice(0, -3) + "e", lower.slice(0, -4));
  let best = ZIPF_DATA.unseenZipf;
  for (const form of forms) {
    const value = ZIPF_DATA.zipf[form];
    if (value !== undefined && value > best) best = value;
  }
  return best;
}

export function findTerms(text: string): string[] {
  return [...new Set(tokenize(text).filter((token) => isAcronym(token) || isIdentifier(token)))];
}

// A term counts as explained when the text pairs it with a parenthetical: "referral (RFL)" or "RFL (referral)".
export function findExplainedTerms(text: string): string[] {
  return findTerms(text).filter((term) => new RegExp(`\\(${escapeRegExp(term)}\\)|\\b${escapeRegExp(term)}\\s+\\(`).test(text));
}

function contentWords(text: string): string[] {
  const words: string[] = [];
  for (const sentence of splitSentences(text)) {
    tokenize(sentence).forEach((token, index) => {
      if (/^\d/.test(token) || token.includes("'") || token.includes("’")) return;
      if (isAcronym(token) || isIdentifier(token)) return;
      // Capitalized words after the first are names, which the reader needs as written.
      if (index > 0 && /^[A-Z]/.test(token)) return;
      for (const part of token.split("-")) {
        if (part && !STOPWORDS.has(part.toLowerCase())) words.push(part);
      }
    });
  }
  return words;
}

function tagSentence(sentence: string): { text: string; tags: Set<string> }[] {
  if (!compromiseNlp) return [];
  return compromiseNlp(sentence)
    .terms()
    .json()
    .map((term: any) => ({ text: String(term.terms[0].normal ?? term.text).toLowerCase(), tags: new Set<string>(term.terms[0].tags ?? []) }));
}

// Words before the main verb, skipping a leading subordinate clause and verbs inside a relative clause.
// Long subjects and clauses between subject and verb both raise it (Gibson 2000; Federal Plain Language Guidelines).
function mainVerbDistance(sentence: string): number | null {
  let terms = tagSentence(sentence);
  if (terms.length === 0) return null;
  if (SUBORDINATORS.has(terms[0].text)) {
    const commaIndex = compromiseNlp!(sentence).terms().json().findIndex((term: any) => /,/.test(term.terms[0].post ?? ""));
    if (commaIndex >= 0) terms = terms.slice(commaIndex + 1);
  }
  const isClauseVerb = (index: number): boolean => {
    const term = terms[index];
    if (!term.tags.has("Verb")) return false;
    const previous = terms[index - 1];
    const beforePrevious = terms[index - 2];
    const next = terms[index + 1];
    // "receiving side" and "pending authorizations" use an -ing verb as an adjective.
    const isModifier =
      previous?.tags.has("Determiner") || previous?.tags.has("Adjective") || (term.tags.has("Gerund") && (next?.tags.has("Noun") || next?.tags.has("Adjective")));
    const isInRelativeClause =
      (previous && RELATIVE_MARKERS.has(previous.text)) ||
      (previous?.tags.has("Pronoun") && beforePrevious?.tags.has("Noun")) ||
      (previous?.tags.has("Auxiliary") && beforePrevious && RELATIVE_MARKERS.has(beforePrevious.text));
    return !isModifier && !isInRelativeClause;
  };
  const clauseVerbs = terms.map((_term, index) => index).filter(isClauseVerb);
  // A participle right after a noun, with another clause verb later, is a reduced relative: "Lines marked Template are".
  const mainVerb = clauseVerbs.find((index, position) => {
    const isReducedRelative =
      terms[index].tags.has("PastTense") && !terms[index].tags.has("Auxiliary") && terms[index - 1]?.tags.has("Noun") && position < clauseVerbs.length - 1;
    return !isReducedRelative;
  });
  return mainVerb ?? null;
}

function countAgentlessPassives(sentence: string): number {
  const terms = tagSentence(sentence);
  let count = 0;
  terms.forEach((term, index) => {
    const isPassiveParticiple = term.tags.has("Passive") && (term.tags.has("PastTense") || term.tags.has("Participle")) && !term.tags.has("Auxiliary");
    if (isPassiveParticiple && !terms.slice(index + 1).some((later) => later.text === "by")) count++;
  });
  return count;
}

function countNounStacks(sentence: string): number {
  const originalTokens = compromiseNlp ? compromiseNlp(sentence).terms().out("array") : [];
  const terms = tagSentence(sentence);
  let count = 0;
  let runStart = -1;
  const closeRun = (end: number) => {
    if (runStart < 0) return;
    const run = terms.slice(runStart, end);
    const nounCount = run.filter((term) => term.tags.has("Noun")).length;
    const allNames = originalTokens.slice(runStart, end).every((token: string) => /^[A-Z]/.test(token));
    const isStack = nounCount >= 3 || (run.length >= 4 && nounCount >= 2);
    if (isStack && run[run.length - 1].tags.has("Noun") && !allNames) count++;
    runStart = -1;
  };
  terms.forEach((term, index) => {
    const isModifierOrNoun =
      (term.tags.has("Noun") || term.tags.has("Adjective")) && !term.tags.has("Pronoun") && !term.tags.has("Value") && !term.tags.has("Determiner");
    if (isModifierOrNoun) {
      if (runStart < 0) runStart = index;
    } else closeRun(index);
  });
  closeRun(terms.length);
  return count;
}

export function computeSignals(text: string, context: TermContext): Signals {
  const masked = maskProtected(text, context.protectedTerms);
  const words = contentWords(masked);
  // Count each rare word once, so writing out an abbreviation that repeats a word is not penalized twice.
  const rareWordList = [...new Map(words.filter((word) => lookupZipf(word) < RARE_WORD_ZIPF).map((word) => [contentLemma(word), word])).values()];
  const explained = new Set([...context.explainedTerms, ...findExplainedTerms(text)]);
  const unexplainedTermList = findTerms(masked).filter((term) => !explained.has(term));
  // An unexplained abbreviation is as unfamiliar as a word the reader has never seen, so writing it out raises familiarity.
  const familiarityValues = [...words.map(lookupZipf), ...unexplainedTermList.map(() => ZIPF_DATA.unseenZipf)];
  const familiarity = familiarityValues.length ? familiarityValues.reduce((sum, value) => sum + value, 0) / familiarityValues.length : null;
  const sentences = splitSentences(text);
  const maskedSentences = splitSentences(masked);
  const hasTags = compromiseNlp !== null;
  const distances = sentences.map(mainVerbDistance).filter((value): value is number => value !== null);
  return {
    rareWords: rareWordList.length,
    unexplainedTerms: unexplainedTermList.length,
    mainVerbDistance: hasTags ? (distances.length ? Math.max(...distances) : null) : null,
    familiarity: familiarity === null ? null : Math.round(familiarity * 100) / 100,
    agentlessPassives: hasTags ? sentences.reduce((sum, sentence) => sum + countAgentlessPassives(sentence), 0) : null,
    nounStacks: hasTags ? maskedSentences.reduce((sum, sentence) => sum + countNounStacks(sentence), 0) : null,
    hiddenVerbs: HIDDEN_VERB_PATTERNS.reduce((sum, pattern) => sum + (text.match(pattern) ?? []).length, 0),
    wordsOver25: sentences.reduce((sum, sentence) => sum + Math.max(0, countWords(sentence) - LONG_SENTENCE_WORDS), 0),
    vagueVerbs: (text.match(VAGUE_VERB_PATTERN) ?? []).length,
    rareWordList,
    unexplainedTermList,
  };
}

// ---------- Gates ----------

function normalizedNumbers(text: string): string[] {
  const numbers = (text.match(/\d[\d,.]*%?/g) ?? []).map((number: string) => number.replace(/,/g, "").replace(/\.$/, ""));
  for (const token of text.toLowerCase().match(/[a-z]+/g) ?? []) if (NUMBER_WORDS[token]) numbers.push(NUMBER_WORDS[token]);
  return numbers.sort();
}

function sameMultiset(first: string[], second: string[]): boolean {
  return first.length === second.length && first.every((value, index) => value === second[index]);
}

function contentLemma(word: string): string {
  return word.toLowerCase().replace(/(ies|es|s|ed|ing)$/, "");
}

export interface GateContext {
  requiredTerms: string[];
  codeSpans: string[];
  documentTerms: string[];
}

// Returns the reasons a candidate fails. An empty list means it keeps the original's meaning markers.
export function checkGates(original: string, candidate: string, context: GateContext): string[] {
  const failures: string[] = [];
  const originalNumbers = normalizedNumbers(original);
  const candidateNumbers = normalizedNumbers(candidate);
  if (!sameMultiset(originalNumbers, candidateNumbers)) {
    failures.push(`numbers changed (${originalNumbers.join(", ") || "none"} → ${candidateNumbers.join(", ") || "none"})`);
  }

  for (const term of context.requiredTerms) {
    if (containsTerm(original, term) && !containsTerm(candidate, term)) failures.push(`dropped protected term "${term}"`);
  }
  for (const code of context.codeSpans) {
    if (original.includes(code) && !candidate.includes(code)) failures.push(`dropped inline code "${code}"`);
  }
  for (const token of tokenize(original).filter(isIdentifier)) {
    if (!candidate.includes(token)) failures.push(`dropped identifier "${token}"`);
  }
  const knownTerms = new Set([...findTerms(original), ...context.documentTerms]);
  for (const term of findTerms(candidate)) if (!knownTerms.has(term)) failures.push(`introduced term "${term}" the document never uses`);

  // A negative verb kept in both texts is fixed; only one that was reworded may trade places with "not".
  const negativeStems = (text: string) => [...text.matchAll(NEGATIVE_VERB_PATTERN)].map((match) => match[1].toLowerCase());
  const originalStems = negativeStems(original);
  const candidateStems = negativeStems(candidate);
  const rewordedCount = (stems: string[], others: string[]) => {
    const remaining = [...others];
    return stems.filter((stem) => {
      const sharedIndex = remaining.indexOf(stem);
      if (sharedIndex < 0) return true;
      remaining.splice(sharedIndex, 1);
      return false;
    }).length;
  };
  const negationRange = (text: string, reworded: number) => {
    const explicit = (text.match(NEGATION_PATTERN) ?? []).length;
    return [explicit, explicit + reworded];
  };
  const [originalLow, originalHigh] = negationRange(original, rewordedCount(originalStems, candidateStems));
  const [candidateLow, candidateHigh] = negationRange(candidate, rewordedCount(candidateStems, originalStems));
  if (candidateLow > originalHigh || candidateHigh < originalLow) failures.push(`negation count changed (${originalLow} → ${candidateLow})`);

  for (const meaningClass of MEANING_CLASSES) {
    const inOriginal = meaningClass.pattern.test(original);
    const inCandidate = meaningClass.pattern.test(candidate);
    if (inOriginal && !inCandidate) failures.push(`dropped ${meaningClass.name}`);
    if (!inOriginal && inCandidate && meaningClass.strict) failures.push(`added ${meaningClass.name}`);
  }

  const originalContent = contentWords(original);
  const candidateContent = contentWords(candidate);
  if (originalContent.length > 0 && candidateContent.length < MIN_CONTENT_LENGTH_RATIO * originalContent.length) {
    failures.push(`content shrank to ${candidateContent.length} of ${originalContent.length} content words`);
  }
  if (originalContent.length >= MIN_CONTENT_WORDS_FOR_OVERLAP) {
    const candidateLemmas = new Set(candidateContent.map(contentLemma));
    const kept = originalContent.filter((word) => candidateLemmas.has(contentLemma(word))).length;
    if (kept / originalContent.length < MIN_CONTENT_OVERLAP) failures.push(`kept only ${kept} of ${originalContent.length} content words`);
  }
  return failures;
}

// ---------- Ranking and decision ----------

export interface Candidate {
  label: string;
  text: string;
  merged?: boolean;
}

export interface SentenceCandidates {
  id: string;
  section?: string;
  original: string;
  codeSpans?: string[];
  explainedBefore?: string[];
  flags?: string[];
  candidates: Candidate[];
}

export interface CandidateFile {
  requiredTerms: string[];
  documentTerms: string[];
  sentences: SentenceCandidates[];
}

interface ScoredCandidate extends Candidate {
  signals: Signals;
  gateFailures: string[];
}

export interface SentenceDecision {
  id: string;
  decision: "keep-original" | "pick" | "merge";
  chosenLabel: string;
  chosenText: string;
  reason: string;
  featureWinners: Partial<Record<SignalName, string[]>>;
  scored: ScoredCandidate[];
}

// Positive when first beats second on the weighted signals; signals either side could not compute are skipped.
function weightedAdvantage(first: Signals, second: Signals): number {
  let advantage = 0;
  for (const spec of SIGNALS) {
    const firstValue = first[spec.name];
    const secondValue = second[spec.name];
    if (firstValue === null || secondValue === null || Math.abs(firstValue - secondValue) <= spec.tieTolerance) continue;
    const firstIsBetter = spec.higherIsBetter ? firstValue > secondValue : firstValue < secondValue;
    advantage += firstIsBetter ? spec.weight : -spec.weight;
  }
  return advantage;
}

function isWorseOnTopTier(candidate: Signals, baseline: Signals): boolean {
  return SIGNALS.filter((spec) => spec.weight === TOP_TIER_WEIGHT).some((spec) => {
    const candidateValue = candidate[spec.name];
    const baselineValue = baseline[spec.name];
    if (candidateValue === null || baselineValue === null || Math.abs(candidateValue - baselineValue) <= spec.tieTolerance) return false;
    return spec.higherIsBetter ? candidateValue < baselineValue : candidateValue > baselineValue;
  });
}

function bestOn(spec: SignalSpec, pool: ScoredCandidate[]): string[] {
  const values = pool.map((candidate) => candidate.signals[spec.name]).filter((value): value is number => value !== null);
  if (values.length === 0) return [];
  const best = spec.higherIsBetter ? Math.max(...values) : Math.min(...values);
  return pool
    .filter((candidate) => candidate.signals[spec.name] !== null && Math.abs(candidate.signals[spec.name]! - best) <= spec.tieTolerance)
    .map((candidate) => candidate.label);
}

export function decide(sentence: SentenceCandidates, file: Pick<CandidateFile, "requiredTerms" | "documentTerms">): SentenceDecision {
  const termContext: TermContext = { protectedTerms: [...file.requiredTerms, ...(sentence.codeSpans ?? [])], explainedTerms: sentence.explainedBefore ?? [] };
  const gateContext: GateContext = { requiredTerms: file.requiredTerms, codeSpans: sentence.codeSpans ?? [], documentTerms: file.documentTerms };
  const original: ScoredCandidate = { label: "original", text: sentence.original, signals: computeSignals(sentence.original, termContext), gateFailures: [] };
  const scored = sentence.candidates.map((candidate) => ({
    ...candidate,
    signals: computeSignals(candidate.text, termContext),
    gateFailures: checkGates(sentence.original, candidate.text, gateContext),
  }));

  // A candidate can replace the original only when it passes every gate, is no worse on the
  // strongest signals, and wins on the weighted signals overall.
  const eligible = scored.filter(
    (candidate) => candidate.gateFailures.length === 0 && !isWorseOnTopTier(candidate.signals, original.signals) && weightedAdvantage(candidate.signals, original.signals) > 0,
  );
  const pool = [original, ...eligible];
  const featureWinners: Partial<Record<SignalName, string[]>> = {};
  for (const spec of SIGNALS) featureWinners[spec.name] = bestOn(spec, pool);
  const base = { id: sentence.id, featureWinners, scored: [original, ...scored] };

  if (eligible.length === 0) {
    return { ...base, decision: "keep-original", chosenLabel: "original", chosenText: sentence.original, reason: "No candidate passed the gates and beat the original." };
  }

  const singles = eligible.filter((candidate) => !candidate.merged);
  const copelandScore = (candidate: ScoredCandidate, others: ScoredCandidate[]) =>
    others.reduce((sum, other) => sum + Math.sign(weightedAdvantage(candidate.signals, other.signals)), 0);
  const rankByCopeland = (candidates: ScoredCandidate[]) =>
    [...candidates].sort((first, second) => copelandScore(second, candidates) - copelandScore(first, candidates) || weightedAdvantage(second.signals, first.signals));
  const bestSingle = singles.length ? rankByCopeland(singles)[0] : undefined;

  const merged = eligible.find((candidate) => candidate.merged);
  if (merged) {
    if (!bestSingle || weightedAdvantage(merged.signals, bestSingle.signals) > 0) {
      return { ...base, decision: "pick", chosenLabel: merged.label, chosenText: merged.text, reason: "The merged version passed the gates and beat every single candidate." };
    }
    return { ...base, decision: "pick", chosenLabel: bestSingle.label, chosenText: bestSingle.text, reason: `The merged version did not beat ${bestSingle.label}, so ${bestSingle.label} stands.` };
  }

  // Pick outright when the leader is best or tied on every weighted-2-or-more signal; otherwise the
  // strengths are split across candidates and a merge can combine them.
  const leader = bestSingle!;
  const contested = SIGNALS.filter((spec) => spec.weight >= 2 && (featureWinners[spec.name] ?? []).length > 0 && !featureWinners[spec.name]!.includes(leader.label));
  if (contested.length === 0 || eligible.length === 1) {
    return { ...base, decision: "pick", chosenLabel: leader.label, chosenText: leader.text, reason: `${leader.label} is best or tied on every major signal.` };
  }
  const contestedText = contested.map((spec) => `${spec.label}: ${featureWinners[spec.name]!.join(", ")}`).join("; ");
  return {
    ...base,
    decision: "merge",
    chosenLabel: leader.label,
    chosenText: leader.text,
    reason: `${leader.label} leads, but other candidates win ${contestedText}. Merge, then score again with the merged version marked "merged": true.`,
  };
}

// ---------- Reports ----------

function escapeCell(text: string): string {
  return text.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function formatSignal(value: number | null): string {
  return value === null ? "–" : String(value);
}

function describeDecision(decision: SentenceDecision): string {
  const header = `| Candidate | Gates | ${SIGNALS.map((spec) => spec.label).join(" | ")} |`;
  const divider = `|---|---|${SIGNALS.map(() => "---|").join("")}`;
  const rows = decision.scored.map((candidate) => {
    const gates = candidate.label === "original" ? "baseline" : candidate.gateFailures.length ? `fail: ${candidate.gateFailures.join("; ")}` : "pass";
    return `| ${candidate.label}${candidate.merged ? " (merged)" : ""} | ${escapeCell(gates)} | ${SIGNALS.map((spec) => formatSignal(candidate.signals[spec.name])).join(" | ")} |`;
  });
  const texts = decision.scored.map((candidate) => `- **${candidate.label}:** ${candidate.text}`);
  const winners = SIGNALS.filter((spec) => (decision.featureWinners[spec.name] ?? []).length > 0)
    .map((spec) => `${spec.label}: ${decision.featureWinners[spec.name]!.join(", ")}`)
    .join("; ");
  const rare = decision.scored[0].signals.rareWordList;
  const unexplained = decision.scored[0].signals.unexplainedTermList;
  return [
    `## ${decision.id}`,
    "",
    ...texts,
    "",
    header,
    divider,
    ...rows,
    "",
    `**Decision:** ${decision.decision} → ${decision.chosenLabel}. ${decision.reason}`,
    "",
    `Best per signal among the original and passing candidates: ${winners || "none"}.`,
    rare.length || unexplained.length ? `Original's rare words: ${rare.join(", ") || "none"}. Unexplained terms: ${unexplained.join(", ") || "none"}.` : "",
  ]
    .filter((line, index, lines) => line !== "" || lines[index - 1] !== "")
    .join("\n");
}

// Each flag's reason tells the rewriters what to fix, so they don't have to guess what made the sentence hard.
const TRIAGE_FLAGS: { flag: string; test: (signals: Signals) => boolean; weight: number; reason: (signals: Signals) => string }[] = [
  { flag: "rare words", test: (signals) => (signals.rareWords ?? 0) > 0, weight: 3, reason: (signals) => `words most readers rarely meet: ${signals.rareWordList.join(", ")}` },
  { flag: "unexplained terms", test: (signals) => (signals.unexplainedTerms ?? 0) > 0, weight: 3, reason: (signals) => `abbreviations or identifiers never explained: ${signals.unexplainedTermList.join(", ")}` },
  { flag: "late main verb", test: (signals) => (signals.mainVerbDistance ?? 0) >= TRIAGE_MAIN_VERB_DISTANCE, weight: 2, reason: (signals) => `the main verb comes after ${signals.mainVerbDistance} words` },
  { flag: "agentless passive", test: (signals) => (signals.agentlessPassives ?? 0) > 0, weight: 1, reason: () => "a passive verb hides who acts" },
  { flag: "noun stack", test: (signals) => (signals.nounStacks ?? 0) > 0, weight: 1, reason: () => "a stack of nouns used as one long label" },
  { flag: "hidden verb", test: (signals) => (signals.hiddenVerbs ?? 0) > 0, weight: 1, reason: () => 'an action buried in a noun, like "the approval of"' },
  { flag: "long sentence", test: (signals) => (signals.wordsOver25 ?? 0) > 0, weight: 1, reason: (signals) => `${signals.wordsOver25} words past 25` },
  { flag: "vague verb", test: (signals) => (signals.vagueVerbs ?? 0) > 0, weight: 1, reason: () => "a vague verb such as handle, ensure, or leverage" },
];

export function triage(draftMarkdown: string, requiredTerms: string[]): { file: CandidateFile; report: string } {
  const blocks = parseBlocks(draftMarkdown).filter((block) => block.kind === "paragraph" || block.kind === "item");
  const documentText = blocks.map((block) => block.text).join("\n");
  const documentTerms = findTerms(documentText);
  const sentences: SentenceCandidates[] = [];
  const rows: string[] = [];
  let explainedSoFar: string[] = [];
  let sentenceNumber = 0;

  for (const block of blocks) {
    for (const sentence of splitSentences(block.text)) {
      sentenceNumber++;
      const codeSpans = block.inlineCode.filter((code) => sentence.includes(code));
      const signals = computeSignals(sentence, { protectedTerms: [...requiredTerms, ...codeSpans], explainedTerms: explainedSoFar });
      const flags = TRIAGE_FLAGS.filter((triageFlag) => triageFlag.test(signals));
      const priority = flags.reduce((sum, triageFlag) => sum + triageFlag.weight, 0);
      if (priority >= TRIAGE_MIN_PRIORITY) {
        const id = `s${sentenceNumber}`;
        sentences.push({ id, section: block.sectionHeading, original: sentence, codeSpans, explainedBefore: [...explainedSoFar], flags: flags.map((triageFlag) => triageFlag.reason(signals)), candidates: [] });
        const detail = [
          signals.rareWordList.length ? `rare: ${signals.rareWordList.join(", ")}` : "",
          signals.unexplainedTermList.length ? `terms: ${signals.unexplainedTermList.join(", ")}` : "",
        ].filter(Boolean).join("; ");
        rows.push(`| ${id} | ${escapeCell(block.sectionHeading)} | ${block.onMainPath ? "main" : "collapsed"} | ${priority} | ${flags.map((triageFlag) => triageFlag.flag).join(", ")} | ${escapeCell(detail)} | ${escapeCell(sentence)} |`);
      }
      explainedSoFar = [...new Set([...explainedSoFar, ...findExplainedTerms(sentence)])];
    }
  }

  const report = [
    "# Plainness Triage",
    "",
    `${sentences.length} of ${sentenceNumber} prose sentences are flagged. Priority adds each flag's weight: rare words and unexplained terms 3, a late main verb 2, the rest 1; a sentence is flagged at priority ${TRIAGE_MIN_PRIORITY} or more. Rare means SUBTLEX-US Zipf below ${RARE_WORD_ZIPF}; required terms and inline code are exempt.`,
    compromiseNlp ? "" : "\ncompromise is not installed, so main-verb distance, agentless passives, and noun stacks were not run. Run `bun install` in the skill folder.",
    "",
    "| ID | Section | Path | Priority | Flags | Detail | Sentence |",
    "|---|---|---|---|---|---|---|",
    ...rows,
  ].join("\n");
  return { file: { requiredTerms, documentTerms, sentences }, report };
}

// ---------- CLI ----------

function main(): void {
  const usage = [
    "Usage:",
    "  bun ScorePlainness.ts triage <draft.md|.html|.txt> [--required <term,term,...>] [--out <dir>]",
    "  bun ScorePlainness.ts score <plain-candidates.json> [--out <dir>]",
  ].join("\n");
  const [mode, inputPath, ...rest] = process.argv.slice(2);
  let outDir: string | undefined;
  let requiredTerms: string[] = [];
  for (let index = 0; index < rest.length; index++) {
    if (rest[index] === "--out") outDir = rest[++index];
    else if (rest[index] === "--required") requiredTerms = rest[++index].split(",").map((term) => term.trim()).filter(Boolean);
  }
  if (!inputPath || (mode !== "triage" && mode !== "score")) {
    console.error(usage);
    process.exit(1);
  }

  const write = (name: string, content: string) => {
    if (!outDir) return console.log(content);
    mkdirSync(resolve(outDir), { recursive: true });
    writeFileSync(join(resolve(outDir), name), content);
  };

  if (mode === "triage") {
    const { file, report } = triage(readDraft(inputPath), requiredTerms);
    write("plainness.md", report + "\n");
    write("plain-candidates.json", JSON.stringify(file, null, 2) + "\n");
    if (outDir) console.log(`Wrote plainness.md and plain-candidates.json to ${resolve(outDir)} (${file.sentences.length} flagged)`);
    return;
  }

  const file: CandidateFile = JSON.parse(readFileSync(resolve(inputPath), "utf8"));
  const decisions = file.sentences.filter((sentence) => sentence.candidates.length > 0).map((sentence) => decide(sentence, file));
  const tally = (kind: SentenceDecision["decision"]) => decisions.filter((decision) => decision.decision === kind).length;
  const report = [
    "# Plainness Scores",
    "",
    `${decisions.length} sentences scored: ${tally("pick")} pick, ${tally("merge")} merge, ${tally("keep-original")} keep original.`,
    compromiseNlp ? "" : "\ncompromise is not installed, so tag-based signals show –. Run `bun install` in the skill folder.",
    "",
    decisions.map(describeDecision).join("\n\n"),
  ].join("\n");
  write("plain-scores.md", report + "\n");
  write(
    "plain-decisions.json",
    JSON.stringify(decisions.map(({ id, decision, chosenLabel, chosenText, reason, featureWinners }) => ({ id, decision, chosenLabel, chosenText, reason, featureWinners })), null, 2) + "\n",
  );
  if (outDir) console.log(`Wrote plain-scores.md and plain-decisions.json to ${resolve(outDir)}`);
}

if (import.meta.main) main();
