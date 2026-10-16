import { describe, expect, test } from "bun:test";
import { checkGates, computeSignals, decide, triage, type SentenceCandidates } from "./ScorePlainness.ts";

const noGateContext = { requiredTerms: [], codeSpans: [], documentTerms: [] };
const noTermContext = { protectedTerms: [], explainedTerms: [] };

describe("checkGates", () => {
  test("passes a faithful plain rewrite", () => {
    expect(checkGates("Users must close one referral before opening another.", "Users must close one referral before they open another.", noGateContext)).toEqual([]);
    expect(checkGates("The editor allows up to 25 open referrals.", "You can have up to 25 referrals open in the editor.", noGateContext)).toEqual([]);
  });

  test("lets a negative verb become an explicit negation, but not lose one", () => {
    expect(checkGates("The checked export sender code excludes draft invoices.", "The export code does not send draft invoices.", noGateContext)).toEqual([]);
    expect(checkGates("The checked export sender code excludes draft invoices.", "The export code leaves out draft invoices.", noGateContext)).toEqual([]);
    expect(checkGates("The export code does not send draft invoices.", "The export code sends draft invoices.", noGateContext)).toEqual(["negation count changed (1 → 0)"]);
  });

  test("rejects a dropped number", () => {
    expect(checkGates("The editor allows 25 open referrals.", "The editor limits open referrals.", noGateContext)[0]).toMatch(/numbers changed/);
  });

  test("rejects flipped negation", () => {
    expect(checkGates("The receiver is not told when it is denied.", "The receiver is told when it is denied.", noGateContext)).toContain("negation count changed (1 → 0)");
  });

  test("accepts if-not in place of unless", () => {
    expect(checkGates("Send it unless the record is closed.", "Send it if the record is not closed.", noGateContext)).toEqual([]);
  });

  test("rejects dropped or added scope words", () => {
    expect(checkGates("Only approved authorizations are sent.", "Approved authorizations are sent.", noGateContext)).toContain("dropped restriction (only)");
    expect(checkGates("Approved authorizations are sent.", "All approved authorizations are sent.", noGateContext)).toContain("added universal (all/every)");
    expect(checkGates("Users must close it first.", "Users close it first.", noGateContext)).toContain("dropped obligation (must)");
  });

  test("accepts synonyms within a meaning class", () => {
    const original = "Sending alone would leave payers with outdated authorizations, so the receiving side has to come with it.";
    expect(checkGates(original, "If we only build sending, payers would end up with old authorizations, so we have to build receiving too.", noGateContext)).toEqual([]);
    expect(checkGates(original, "Payers need the receiving change too, because sending by itself would leave them with old authorizations.", noGateContext)).toEqual([]);
  });

  test("rejects a dropped cause or condition", () => {
    expect(checkGates("It stays pending because the receiver is never told.", "It stays pending and the receiver is never told.", noGateContext)).toContain(
      "dropped cause (because/so)",
    );
    expect(checkGates("If it is denied later, the copy stays pending.", "A later denial leaves the copy pending.", noGateContext)).toContain(
      "dropped condition (if/unless/when)",
    );
  });

  test("protects required terms and identifiers, and rejects invented terms", () => {
    const context = { requiredTerms: ["payer-to-payer API"], codeSpans: [], documentTerms: ["RFL"] };
    expect(checkGates("The payer-to-payer API sends it.", "The API sends it.", context)).toContain('dropped protected term "payer-to-payer API"');
    expect(checkGates("It calls getPendingAuths first.", "It looks up pending authorizations first.", noGateContext)).toContain('dropped identifier "getPendingAuths"');
    expect(checkGates("The referral is closed.", "The UMR record is closed.", context)).toContain('introduced term "UMR" the document never uses');
    expect(checkGates("The referral is closed.", "The referral (RFL) is closed.", context)).toEqual([]);
  });

  test("rejects a rewrite that drops most of the content", () => {
    expect(checkGates("The receiving system skips later revisions of an authorization it already stored.", "Revisions are skipped.", noGateContext)[0]).toMatch(
      /content shrank/,
    );
  });
});

describe("computeSignals", () => {
  test("counts rare words and skips required terms", () => {
    expect(computeSignals("The nominalization obfuscates the antecedent.", noTermContext).rareWords).toBe(3);
    expect(computeSignals("Each payer sends it.", { protectedTerms: ["payer"], explainedTerms: [] }).rareWords).toBe(0);
  });

  test("matches abbreviations as whole words", () => {
    expect(computeSignals("The prompts targets gets splits.", { protectedTerms: ["TS"], explainedTerms: [] }).rareWordList).toEqual([]);
  });

  test("treats a parenthetical as an explanation", () => {
    expect(computeSignals("The RFL is closed.", noTermContext).unexplainedTermList).toEqual(["RFL"]);
    expect(computeSignals("The referral (RFL) is closed.", noTermContext).unexplainedTerms).toBe(0);
    expect(computeSignals("The RFL is closed.", { protectedTerms: [], explainedTerms: ["RFL"] }).unexplainedTerms).toBe(0);
  });

  test("measures words before the main verb past relative clauses and modifiers", () => {
    expect(computeSignals("The team that owns the payer interface we built last year decides the rollout.", noTermContext).mainVerbDistance).toBe(11);
    expect(computeSignals("The checked export sender code excludes draft invoices.", noTermContext).mainVerbDistance).toBe(5);
    expect(computeSignals("If it is denied, the receiver never hears about it.", noTermContext).mainVerbDistance).toBe(3);
  });

  test("finds agentless passives, hidden verbs, and vague verbs", () => {
    expect(computeSignals("The plan was drafted.", noTermContext).agentlessPassives).toBe(1);
    expect(computeSignals("The plan was drafted by the team.", noTermContext).agentlessPassives).toBe(0);
    expect(computeSignals("We made a decision regarding the approval of the plan.", noTermContext).hiddenVerbs).toBe(2);
    expect(computeSignals("We leverage the queue to ensure delivery.", noTermContext).vagueVerbs).toBe(2);
  });
});

describe("decide", () => {
  const file = { requiredTerms: [], documentTerms: [] };
  const sentence = (candidates: SentenceCandidates["candidates"], original = "The checked export sender code excludes draft invoices unless the batch is closed."): SentenceCandidates => ({
    id: "s1",
    original,
    candidates,
  });

  test("keeps the original when no candidate passes and improves", () => {
    const decision = decide(sentence([{ label: "A", text: "The export code sends draft invoices." }]), file);
    expect(decision.decision).toBe("keep-original");
  });

  test("picks the candidate that wins every major signal", () => {
    const decision = decide(
      sentence([
        { label: "A", text: "The export code leaves out draft invoices unless the batch is closed." },
        { label: "B", text: "The checked export sender code omits draft invoices unless the batch is closed." },
      ]),
      file,
    );
    expect(decision.decision).toBe("pick");
    expect(decision.chosenLabel).toBe("A");
  });

  test("asks for a merge when strengths are split, then keeps the merge only if it wins", () => {
    const original = "The aforementioned remediation obviates subsequent reconciliation of the records unless the batch is closed.";
    const split = sentence(
      [
        { label: "A", text: "This fix removes the need to reconcile the records later unless the batch is closed and the export is done." },
        { label: "B", text: "Unless the batch is closed, the aforementioned remediation avoids later reconciliation of records." },
      ],
      original,
    );
    const first = decide(split, file);
    expect(["merge", "pick"]).toContain(first.decision);

    const withMerge = { ...split, candidates: [...split.candidates, { label: "merged", text: "Unless the batch is closed, this fix means nobody has to match up the records later.", merged: true }] };
    const second = decide(withMerge, file);
    expect(second.decision).toBe("pick");
  });
});

describe("triage", () => {
  test("flags jargon-heavy sentences and leaves plain ones alone", () => {
    const { file } = triage(
      "# Summary\n\nThe team sends the file each week.\n\nThe checked export sender code excludes draft invoices from the RFL batch.\n",
      [],
    );
    expect(file.sentences.map((flagged) => flagged.original)).toEqual(["The checked export sender code excludes draft invoices from the RFL batch."]);
    expect(file.documentTerms).toContain("RFL");
  });

  test("exempts inline code and required terms", () => {
    const { file } = triage("The `getPendingAuths` call returns each payer record.\n", ["payer"]);
    expect(file.sentences).toEqual([]);
  });
});
