# Safety Patterns — MUMPS

> Runtime safety in M requires explicit variable scoping, API-first data access, and disciplined lock and trap management.

## Mental Model

Local symbol tables belong to a process; calls within it can share locals. Globals can provide shared persistent storage. Variable scope discipline — NEWing locals, avoiding argumentless KILL, validating parameters — prevents cross-call contamination that is nearly impossible to diagnose in production. For a Chronicles project, use supported APIs established by its actual contract. Direct global access and `$order` are normal M operations; suitability depends on data ownership and application requirements. Concurrency discipline closes the loop: consistent lock ordering, timeouts, and cleanup reduce concurrency failures; wrappers do not guarantee deadlock freedom. Error handling must follow the runtime/project contract. These three layers — scope isolation, API-first access, and defensive concurrency — form the runtime safety net that keeps Chronicles systems stable under operational load.

## Consumer Guide

### When Reviewing Code

- Confirm owned scratch locals are NEWed and initialized; preserve formal inputs and intentional shared outputs.
- Flag argumentless KILL and broad kill patterns.
- Flag proprietary storage coupling where the actual project requires its verified API.
- Apply explicit-global house policy; distinguish null-key data from valid traversal sentinels.
- Where required, check the actual project lock-wrapper contract.
- Verify the error-handler contract, including valid inherited handlers.

### When Designing / Planning

- Decide variable ownership at routine boundaries.
- For Chronicles projects, use APIs verified for the actual runtime/project contract.
- Define lock scope, ordering strategy, and timeout behavior.

### When Implementing

- NEW and initialize owned scratch locals; preserve formal inputs and intentional shared outputs.
- Prefer verified project API wrappers where the data-access contract requires them.
- Use project-required lock wrappers and establish or preserve the applicable error handler.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| NewVariablesBeforeUse | CRITICAL | NEW owned scratch locals and initialize before reading |
| AvoidArgumentlessKill | CRITICAL | Never clear symbol tables with broad or implicit KILL patterns |
| ProtectScratchVariables | HIGH | Avoid unsafe assumptions about shared scratch variables |
| ValidateRequiredParameters | HIGH | Verify required arguments before executing business logic |
| PreferChroniclesApisOverDirectGlobals | CONDITIONAL | Use project-verified APIs for proprietary data where required |
| UseApiLoopingInsteadOfRawOrder | CONDITIONAL | Use verified application APIs for proprietary traversal where required |
| AvoidNakedGlobalReferences | CONDITIONAL | Keep every global reference explicit and stable |
| AvoidNullValuedSubscripts | CONDITIONAL | Reject unintended empty data keys; permit valid traversal sentinels |
| UseChroniclesLockWrappers | CONDITIONAL | Use verified project lock contracts and check ordering, timeouts, cleanup |
| SetStandardErrorTrap | CONDITIONAL | Establish or preserve the applicable error-handling contract |

#### VariableScope

---

### M4.1 NEW Variables Before Use

**Impact: CRITICAL (Leaked symbol-table state causes cross-call corruption)**

NEW owned scratch locals, then initialize them before reading. NEW saves prior state and leaves the local undefined, not zero. Formal parameters already receive parameter-passing scope treatment; do not blindly NEW inputs or intentional shared outputs.

**Avoid:**
```m
  set tmp=tmp+1
```

**Prefer:**
```m
  new tmp
  set tmp=0
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

**Impact: HIGH when missing or invalid inputs cause errors or corrupt results**

Validate required parameters at tag entry and return explicit error values on precondition failure.

Fail fast before any data mutation or lock acquisition.

#### DataGlobals

---

### M5.1 Prefer Chronicles APIs Over Direct Globals

**Impact: CONDITIONAL (Policy alone is low severity; assess demonstrated data or concurrency harm)**

For an actual Chronicles project, use APIs documented as supported by its runtime/version and project contract. General M documentation cannot establish their existence, signatures, or guarantees. Direct globals can be appropriate for application-owned M storage.

Avoid undocumented proprietary storage coupling. Prefer the project-verified API and signature. No proprietary global or wrapper call is asserted here to be available or compatible.

---

### M5.2 Use API Looping Instead of Raw `$ORDER`

**Impact: CONDITIONAL (Policy alone is low severity; assess demonstrated data or concurrency harm)**

For Chronicles structures, prefer looping APIs verified for the actual runtime/project contract over undocumented storage-layout traversal. Raw `$order` remains appropriate for owned arrays and globals where their contract permits it.

---

### M5.3 Avoid Naked Global References

**Impact: CONDITIONAL (Policy alone is low severity; assess demonstrated data or concurrency harm)**

Do not rely on implicit naked global state. Keep each global reference explicit to prevent accidental reads/writes to unintended nodes.

---

### M5.4 Avoid Null-Valued Subscripts

**Impact: CONDITIONAL (Policy alone is low severity; assess demonstrated data or concurrency harm)**

House policy: reject unintended empty-string data keys. YottaDB null-key support depends on local settings or global-region settings (ALWAYS, NEVER, EXISTING); check the deployed version/configuration.

An empty-string sentinel in `$order(array(""))` starts traversal without creating a null-key node. If null-key data is intentionally supported, ordinary `$order` traversal needs special handling for it.

#### ConcurrencyAndErrors

---

### M6.1 Use Chronicles Lock Wrappers

**Impact: CONDITIONAL (Policy alone is low severity; assess demonstrated data or concurrency harm)**

Use wrappers when the actual project requires and documents them; general M documentation does not establish their signatures or guarantees. Standalone M may use LOCK directly. Review ordering, acquisition success, timeouts, and ownership; a wrapper alone cannot prevent deadlocks.

Acquire locks before mutation and release them on every exit path.

---

### M6.2 Set Standard Error Trap

**Impact: CONDITIONAL (Depends on error propagation, logging, and recovery requirements)**

Establish the error-handling contract before mutation-heavy logic. A valid inherited handler can satisfy it; do not overwrite one merely to add local setup. Use project trap wrappers only where their contract is known.

Trap setup should be consistent across routines so failures route through common logging and recovery behavior.

## Does Not Cover

- ANSI portability baseline and implementation isolation (see Standards).
- Syntax formatting and whitespace sensitivity (see Standards).
- Naming conventions and header documentation (see Standards).

## Sources

- [YottaDB NEW, KILL, LOCK](https://docs.yottadb.com/ProgrammersGuide/commands.html)
- [YottaDB language features and null subscripts](https://docs.yottadb.com/ProgrammersGuide/langfeat.html)
- [YottaDB $ORDER](https://docs.yottadb.com/ProgrammersGuide/functions.html)
- [YottaDB error processing](https://docs.yottadb.com/ProgrammersGuide/errproc.html)
- [YottaDB local/global storage](https://docs.yottadb.com/ProgrammersGuide/about.html)

These public sources do not verify proprietary Chronicles APIs. Application-specific rules require the actual runtime/project contract.
