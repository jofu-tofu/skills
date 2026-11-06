# CriticalThinking Orchestrator

> Thin orchestrator. Spawn agents, check artifacts, pass file paths, advance to next wave.
> Agents read their own workflow files and produce their own outputs.
> Never perform analysis or reasoning — that is the agents' role.

## Step 0: Resolve Paths

Resolve `SKILL_ROOT` from the actual loaded `CriticalThinking/SKILL.md` location (the parent of this Workflows directory). Verify its workflow files exist. Do not assume a Git repository, nested `skills/` directory, shell or installed hook.

## Path Conventions

Use the user's requested output directory when supplied; otherwise create a fresh task directory under the current workspace. An available host context directory may be used, but is not a dependency. Preserve earlier runs rather than overwriting them.

Use actual host delegation with separate context for each stage. Do not inherit other perspectives through a full-conversation fork. If capacity is limited, batch independent agents while keeping distinct invocations. If delegation is unavailable, report that native pipeline execution is unavailable; do not invent agents or claim isolated analysis. Preserve useful completed artifacts and clearly label any limited answer.

Record stage task identifiers, input artifact identities and completion state. Separate context limits direct sharing; it does not establish statistically independent evidence.

## Step 1: Setup

Capture the user's prompt verbatim. Create the output directory:

```bash
mkdir -p $THINK_DIR
```

Write the user's original prompt to `$THINK_DIR/prompt.txt`.

## Wave 1: Reframe

Spawn a single agent:
- **prompt:** `"Read $SKILL_ROOT/Workflows/Reframe.md and execute it. The user's problem is in: $THINK_DIR/prompt.txt. Write your output to these 5 files: $THINK_DIR/perspective-1.md, $THINK_DIR/perspective-2.md, $THINK_DIR/perspective-3.md, $THINK_DIR/perspective-4.md, $THINK_DIR/perspective-5.md. When done, return the absolute paths to all 5 files."`
- **subagent_type:** `general-purpose`

**CHECK:** All 5 perspective files belong to this run, exist, are non-empty and the producing invocation completed successfully.
- If any missing → retry once with same prompt.
- If still missing → report to user: "Reframe agent failed after 2 attempts. Analysis aborted."

## Wave 2: Decompose

Spawn 5 distinct agents, one per perspective file, batching within available host capacity:

- **subagent_type:** `general-purpose`
- **prompt for agent N (1-5):**

```
Read $SKILL_ROOT/Workflows/Decompose.md and execute it.

Your perspective file is: $THINK_DIR/perspective-N.md
The original problem is in: $THINK_DIR/prompt.txt

Read your perspective file — it contains a reframed version of the problem from one lens. Perform a first-principles decomposition of the problem WITHIN that lens.

Append your decomposition to the SAME file: $THINK_DIR/perspective-N.md
Read ONLY your assigned perspective file. Do not read other perspective files.
If retrying this stage, replace only its incomplete decomposition section; preserve reframing and do not append duplicate sections.

When done, return the absolute path to the file you updated.
```

**Synchronization:** Store each agent's task_id and perspective number. After all spawned:
1. Wait for all 5 agents to complete
2. Verify each perspective file contains a non-empty `## First-Principles Decomposition` section written by this stage, and its invocation completed. If missing, stale, partial or failed, retry that stage once.
3. Confirm all 5 files updated

Use mechanical artifact checks and completion receipts; a header alone is insufficient. Do not perform the agents' domain analysis. If recovery still fails, mark the affected stage incomplete, preserve completed work and report the specific limit rather than dispatching a dependent stage as though its input were complete.

## Wave 3: Solve

Spawn 5 distinct agents, one per perspective file, batching within available host capacity:

- **subagent_type:** `general-purpose`
- **prompt for agent N (1-5):**

```
Read $SKILL_ROOT/Workflows/Solve.md and execute it.

Your perspective file is: $THINK_DIR/perspective-N.md
The original problem is in: $THINK_DIR/prompt.txt

Read your perspective file — it contains a reframed problem and a first-principles decomposition from one lens. Explore feasible approaches with trade-offs. Preserve rejected or qualified premises; fewer than two options is valid when constraints leave only one useful option.

Append your approaches to the SAME file: $THINK_DIR/perspective-N.md
Read ONLY your assigned perspective file. Do not read other perspective files.
If retrying this stage, replace only its incomplete approaches section; preserve earlier completed stages and do not duplicate sections.

When done, return the absolute path to the file you updated.
```

**Synchronization:** Same completion/freshness/recovery pattern as Wave 2. Verify all 5 files contain a non-empty `## Approaches` section produced by the current stage. Second failure leaves an explicit incomplete result.

## Wave 4: Synthesize

Spawn a single agent:
- **prompt:** `"Read $SKILL_ROOT/Workflows/Synthesize.md and execute it. The 5 perspective files are: $THINK_DIR/perspective-1.md, $THINK_DIR/perspective-2.md, $THINK_DIR/perspective-3.md, $THINK_DIR/perspective-4.md, $THINK_DIR/perspective-5.md. The original problem is in: $THINK_DIR/prompt.txt. Write your synthesis to: $THINK_DIR/synthesis.md. Return the synthesis content AND the absolute path to synthesis.md."`
- **subagent_type:** `general-purpose`

**CHECK:** The synthesis invocation completed and `$THINK_DIR/synthesis.md` belongs to this run and is non-empty. On failure, retry once without rerunning completed prior stages; second failure remains incomplete. If writing is unavailable, preserve returned content and report the unwritten path instead of claiming file delivery.

Output the synthesis to the user.
