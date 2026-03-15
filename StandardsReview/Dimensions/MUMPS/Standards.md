# Standards — MUMPS

> Portable, consistently formatted, and clearly named M code is the foundation of maintainable Chronicles systems.

## Mental Model

M code quality begins with three interlocking disciplines: portability, formatting, and naming. Portability means defaulting to ANSI-compatible behavior so code survives engine upgrades and cross-platform deployment — vendor-specific features belong in wrapper layers, not business logic. Formatting in M is not cosmetic; whitespace is syntax-significant, so inconsistent spacing or null lines can alter parse behavior. Naming completes the picture: routines and tags are public interfaces, and ambiguous names or missing headers make every caller a guessing game. Together, these three concerns define the "form" of well-written M code — the structural baseline that makes deeper concerns (scoping, data access, concurrency) reviewable and safe.

## Consumer Guide

### When Reviewing Code

- Flag non-portable implementation commands in routine logic.
- Check identifier lengths remain within portable limits.
- Verify command spacing consistency and absence of null code lines.
- Confirm routine/tag names are descriptive with valid start forms.
- Require routine and tag headers for public interfaces.

### When Designing / Planning

- Choose ANSI-compatible constructs first; document exceptions.
- Standardize spacing and command-style conventions per module.
- Define naming patterns and header templates before broad implementation.

### When Implementing

- Prefer standards-compliant commands in core logic.
- Keep whitespace edits as behavior-sensitive changes.
- Use descriptive names and maintain current headers.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| PreferAnsiMCore | CRITICAL | Keep core routine logic within ANSI-compatible M behavior |
| IsolateImplementationSpecificCode | CRITICAL | Contain vendor-specific behavior in dedicated wrapper routines |
| EnforcePortableNameLimits | CRITICAL | Keep routine, tag, variable, and global names in portable bounds |
| AvoidNonPortableDeviceCommands | HIGH | Use wrapper APIs for device and OS interactions |
| RespectMWhitespaceSensitivity | HIGH | Treat spacing and indentation as syntax-level concerns |
| KeepCommandSpacingConsistent | HIGH | Keep command and argument spacing predictable and uniform |
| AvoidNullCodeLines | MEDIUM | Ensure each code line is executable code or a comment |
| UseConsistentCommandStyle | MEDIUM | Do not mix short and long command forms arbitrarily |
| UseDescriptiveRoutineAndTagNames | HIGH | Choose names that describe behavior, not local shorthand |
| FollowTagStartRules | HIGH | Tag names must follow valid starting-character rules |
| IncludeTagParentheses | HIGH | Use explicit tag definitions for callable interfaces |
| MaintainRoutineAndTagHeaders | HIGH | Keep routine/tag headers current and actionable |

#### Portability

---

### M1.1 Prefer ANSI M Core

**Impact: CRITICAL (Portability across IRIS and GT.M depends on this baseline)**

Default to ANSI-compatible M behavior in released code paths. Use implementation-specific features only when required and only behind explicit wrappers.

**Avoid:** writing core business logic around vendor-only commands, variables, or relaxed syntax.

**Prefer:** ANSI-compatible command/function usage in routine logic, with implementation-specific logic isolated in dedicated wrapper routines.

---

### M1.2 Isolate Implementation-Specific Code

**Impact: CRITICAL (Uncontained vendor behavior breaks upgrade and cross-platform safety)**

Implementation-dependent behavior belongs in designated wrapper layers, not in application routines.

**Avoid:**
```m
set x=$zv
if x["GT.M" zwrite ^TMP("A")
```

**Prefer:**
```m
set %=$$zPlatformAction^%ZdWrapper(args...)
```

Keep call sites implementation-independent.

---

### M1.3 Enforce Portable Name Limits

**Impact: CRITICAL (Name truncation causes collisions and wrong target resolution)**

Keep routine, tag, variable, and global names within portable limits. Some engines allow longer names but resolve by the first 31 characters.

**Rule of thumb:** if two identifiers only differ after character 31, they are unsafe.

---

### M1.4 Avoid Non-Portable Device Commands

**Impact: HIGH (Device handling differences can break runtime behavior)**

Do not rely on implementation-specific `OPEN`, `USE`, `CLOSE`, or device semantics in shared code.

**Avoid:** direct device command variants that only work in one implementation.

**Prefer:** wrapper functions for file/socket/device operations and timeouts.

#### SyntaxFormatting

---

### M2.1 Respect M Whitespace Sensitivity

**Impact: HIGH (Whitespace changes can alter parse behavior)**

Whitespace in M is syntax-significant. Formatting edits can change meaning, especially in multi-command lines and post-condition usage.

Treat whitespace edits like logic edits: review and test them.

---

### M2.2 Keep Command Spacing Consistent

**Impact: HIGH (Inconsistent spacing increases parser and review errors)**

Use one spacing standard for commands and arguments in each routine.

**Prefer:**
```m
set x=1,y=2
if x>0 do Tag^ROU()
```

**Avoid:**
```m
set x = 1 , y = 2
if  x > 0  do  Tag^ROU ( )
```

---

### M2.3 Avoid Null Code Lines

**Impact: MEDIUM (Null lines create ambiguity in parser and tooling)**

Every line should contain executable M code or a comment. Do not leave empty executable lines in routines.

---

### M2.4 Use Consistent Command Style

**Impact: MEDIUM (Mixed long/short command forms reduce readability)**

Choose abbreviated or verbose command style per routine/module and use it consistently.

**Avoid:** mixing styles without intent (`set` + `w` + `quit` + `d` in the same routine).

#### NamingAndDocumentation

---

### M3.1 Use Descriptive Routine and Tag Names

**Impact: HIGH (Routines and tags are interface surfaces)**

Names should communicate behavior and intent, not local shorthand or temporary context.

**Avoid:** opaque names that require external tribal knowledge.

**Prefer:** names that make call sites self-explanatory.

---

### M3.2 Follow Tag Start Rules

**Impact: HIGH (Invalid tag forms create portability and parser failures)**

Tag names must begin with a letter or `%`, or be entirely numeric where permitted by standards and conventions.

Do not create alphanumeric tags that begin with a digit.

---

### M3.3 Include Tag Parentheses

**Impact: HIGH (Explicit signatures improve call correctness)**

Use parentheses in tag definitions for callable interfaces, including no-argument tags, unless a documented exception applies (for example entry-point constraints).

**Prefer:**
```m
GetData()
  quit value
```

---

### M3.4 Maintain Routine and Tag Headers

**Impact: HIGH (Without headers, ownership and change intent become unclear)**

Maintain routine/tag headers with purpose, module/context, and revision notes. Keep headers synchronized with current behavior.

Header updates are required when changing public tag behavior or parameter contracts.

## Does Not Cover

- Variable scoping and symbol-table safety (see SafetyPatterns).
- Data access patterns and global hygiene (see SafetyPatterns).
- Locking and error trap behavior (see SafetyPatterns).

## Sources

- Epic Chronicles programmer guidelines and coding standards references
- Epic GT.M ANSI compatibility guidance
- Official InterSystems and YottaDB portability references
- Epic M syntax training references
- Epic coding standards wiki guidance for M tags and headers
