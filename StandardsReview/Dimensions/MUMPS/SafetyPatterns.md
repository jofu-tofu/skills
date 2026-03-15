# Safety Patterns — MUMPS

> Runtime safety in M requires explicit variable scoping, API-first data access, and disciplined lock and trap management.

## Mental Model

M processes share mutable symbol tables and global storage with minimal guardrails, so runtime safety is entirely the programmer's responsibility. Variable scope discipline — NEWing locals, avoiding argumentless KILL, validating parameters — prevents cross-call contamination that is nearly impossible to diagnose in production. Data access discipline means preferring Chronicles APIs over direct global references; raw global coupling is fast but brittle to schema changes, and raw `$order` traversal encodes storage assumptions that break silently. Concurrency discipline closes the loop: wrapper-driven locking prevents deadlocks and inconsistency, while standard trap initialization ensures failures route through common logging rather than disappearing. These three layers — scope isolation, API-first access, and defensive concurrency — form the runtime safety net that keeps Chronicles systems stable under operational load.

## Consumer Guide

### When Reviewing Code

- Confirm local variables are NEWed before mutation in reusable routines.
- Flag argumentless KILL and broad kill patterns.
- Flag direct global access where released APIs exist.
- Reject naked global references and null-valued subscripts.
- Ensure lock acquisition follows approved wrapper patterns.
- Verify standard trap setup exists before risky operations.

### When Designing / Planning

- Decide variable ownership at routine boundaries.
- Design data workflows around supported Chronicles APIs.
- Define lock scope, ordering strategy, and timeout behavior.

### When Implementing

- NEW all routine-local mutable variables.
- Prefer API wrappers for data access and iteration.
- Use standard lock wrappers and initialize error traps early.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| NewVariablesBeforeUse | CRITICAL | NEW local variables to isolate symbol-table side effects |
| AvoidArgumentlessKill | CRITICAL | Never clear symbol tables with broad or implicit KILL patterns |
| ProtectScratchVariables | HIGH | Avoid unsafe assumptions about shared scratch variables |
| ValidateRequiredParameters | HIGH | Verify required arguments before executing business logic |
| PreferChroniclesApisOverDirectGlobals | CRITICAL | Use released APIs before direct global reads/writes |
| UseApiLoopingInsteadOfRawOrder | CRITICAL | Prefer API loop primitives over raw `$order` on data globals |
| AvoidNakedGlobalReferences | CRITICAL | Keep every global reference explicit and stable |
| AvoidNullValuedSubscripts | CRITICAL | Never create or rely on null-valued subscripts |
| UseChroniclesLockWrappers | CRITICAL | Use shared lock/unlock wrappers for predictable behavior |
| SetStandardErrorTrap | CRITICAL | Initialize standard trap handling before mutation-heavy logic |

#### VariableScope

---

### M4.1 NEW Variables Before Use

**Impact: CRITICAL (Leaked symbol-table state causes cross-call corruption)**

Routine-local mutable variables should be `NEW`ed before use in reusable code paths.

**Avoid:**
```m
set tmp=tmp+1
```

**Prefer:**
```m
new tmp
set tmp=tmp+1
```

---

### M4.2 Avoid Argumentless KILL

**Impact: CRITICAL (Can destroy expected runtime context)**

Never use argumentless `KILL` in shared logic. It can clear more state than intended and break upstream callers.

Always kill explicit variables only.

---

### M4.3 Protect Scratch Variables

**Impact: HIGH (Shared scratch namespace can be overwritten by called code)**

Do not assume `%` scratch variables remain stable across nested calls unless contractually guaranteed.

Prefer routine-local variables with explicit `NEW` and clear ownership.

---

### M4.4 Validate Required Parameters

**Impact: HIGH (Unchecked inputs produce undefined behavior in deep call stacks)**

Validate required parameters at tag entry and return explicit error values on precondition failure.

Fail fast before any data mutation or lock acquisition.

#### DataGlobals

---

### M5.1 Prefer Chronicles APIs Over Direct Globals

**Impact: CRITICAL (Direct global coupling is brittle to data-layout change)**

Use released Chronicles APIs and wrappers for data reads/writes whenever available.

**Avoid:**
```m
set val=$get(^ERX(ini,id,item))
```

**Prefer:**
```m
set val=$$zGetItem^%Zelibh(ini,id,item)
```

---

### M5.2 Use API Looping Instead of Raw `$ORDER`

**Impact: CRITICAL (Raw traversal encodes storage assumptions)**

For Chronicles structures, prefer supported looping APIs (`$$zoID`, `$$zoDT`, index wrappers) over direct `$order` loops on physical globals.

---

### M5.3 Avoid Naked Global References

**Impact: CRITICAL (Naked references are fragile and context-dependent)**

Do not rely on implicit naked global state. Keep each global reference explicit to prevent accidental reads/writes to unintended nodes.

---

### M5.4 Avoid Null-Valued Subscripts

**Impact: CRITICAL (Null subscript behavior differs across implementations)**

Never construct or depend on null-valued subscripts in local or global references. Guard subscript inputs before composing references.

#### ConcurrencyAndErrors

---

### M6.1 Use Chronicles Lock Wrappers

**Impact: CRITICAL (Ad hoc locking creates contention and inconsistency)**

Use approved lock/unlock wrappers (for example `$$zlock`/`$$zunlock`) instead of custom lock-string handling in application routines.

Acquire locks before mutation and release them on every exit path.

---

### M6.2 Set Standard Error Trap

**Impact: CRITICAL (Without a standard trap, failures become untraceable)**

Initialize the standard trap pattern (for example via shared wrapper conventions) before mutation-heavy logic.

Trap setup should be consistent across routines so failures route through common logging and recovery behavior.

## Does Not Cover

- ANSI portability baseline and implementation isolation (see Standards).
- Syntax formatting and whitespace sensitivity (see Standards).
- Naming conventions and header documentation (see Standards).

## Sources

- Epic coding standards recommendations for custom M code variable hygiene
- Chronicles programmer best-practice guidance
- Epic Chronicles coding guidance on data APIs and global safety
- Epic Chronicles locking guidance
- Epic programming guidelines for trap and failure handling
