# Standards — MUMPS

> Portable, consistently formatted, and clearly named M code is the foundation of maintainable Chronicles systems.

## Mental Model

M code quality begins with three interlocking disciplines: portability, formatting, and naming. Portability requires a declared M standard revision and supported engine/version matrix. Standards-compatible syntax alone does not guarantee compatible behavior. Isolating vendor features in wrappers is house policy. Formatting in M is not cosmetic; whitespace is syntax-significant, so changes to command separators or indentation can alter parse behavior. Naming completes the picture: routines and tags are public interfaces, and ambiguous names or missing headers make every caller a guessing game. Together, these three concerns define the "form" of well-written M code — the structural baseline that makes deeper concerns (scoping, data access, concurrency) reviewable and safe.

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
| PreferAnsiMCore | LOW | Keep core routine logic within ANSI-compatible M behavior |
| IsolateImplementationSpecificCode | LOW | Contain vendor-specific behavior in dedicated wrapper routines |
| EnforcePortableNameLimits | CONDITIONAL | Apply the declared standard revision and engine-specific name limits |
| AvoidNonPortableDeviceCommands | HIGH | Use wrapper APIs for device and OS interactions |
| RespectMWhitespaceSensitivity | HIGH | Treat spacing and indentation as syntax-level concerns |
| KeepCommandSpacingConsistent | HIGH | Keep command and argument spacing predictable and uniform |
| AvoidNullCodeLines | LOW | Ensure each code line is executable code or a comment |
| UseConsistentCommandStyle | LOW | Do not mix short and long command forms arbitrarily |
| UseDescriptiveRoutineAndTagNames | LOW | Choose names that describe behavior, not local shorthand |
| FollowTagStartRules | HIGH | Tag names must follow valid starting-character rules |
| IncludeTagParentheses | LOW | Use explicit tag definitions for callable interfaces |
| MaintainRoutineAndTagHeaders | LOW | Keep routine/tag headers current and actionable |

#### Portability

---

### M1.1 Prefer ANSI M Core

**Impact: LOW (House policy; assess demonstrated compatibility or caller harm separately)**

Declare the target standard revision and supported engine versions; default to their common ANSI-compatible behavior in released code paths. Use implementation-specific features only when required and only behind explicit wrappers.

**Avoid:** writing core business logic around vendor-only commands, variables, or relaxed syntax.

**Prefer:** ANSI-compatible command/function usage in routine logic, with implementation-specific logic isolated in dedicated wrapper routines.

---

### M1.2 Isolate Implementation-Specific Code

**Impact: LOW (House policy; assess demonstrated compatibility or caller harm separately)**

Implementation-dependent behavior belongs in designated wrapper layers, not in application routines.

**Avoid:**
```m
  set x=$zv
  if x["GT.M" zwrite ^TMP("A")
```

**Prefer:**
```m
  set result=$$Action^PLATWRAP(arg)
```

Keep call sites implementation-independent. `PLATWRAP` is an illustrative project-provided wrapper, not a verified Chronicles API.

---

### M1.3 Enforce Portable Name Limits

**Impact: CONDITIONAL (High for demonstrated collisions or rejection on a supported target)**

Specify the standard revision, engine versions, identifier kind, and toolchain. YottaDB documents 31-character identifiers and describes eight characters as M portability guidance; 31 is not a universal ANSI limit. IRIS 2026.2 documents first-31-character uniqueness for locals and labels, but first-255-character uniqueness for routines. Use the smallest supported limit; do not extrapolate variable truncation to every identifier kind.

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

**Impact: LOW (House policy; assess demonstrated compatibility or caller harm separately)**

House policy: prefer comment separator lines to blank lines for consistent tooling. A blank line alone does not demonstrate a runtime defect; check the target parser and any line-offset references. Preserve required command spacing independently of this convention.

---

### M2.4 Use Consistent Command Style

**Impact: LOW (House policy; assess demonstrated compatibility or caller harm separately)**

Choose abbreviated or verbose command style per routine/module and use it consistently.

**Avoid:** mixing styles without intent (`set` + `w` + `quit` + `d` in the same routine).

#### NamingAndDocumentation

---

### M3.1 Use Descriptive Routine and Tag Names

**Impact: LOW (House policy; assess demonstrated compatibility or caller harm separately)**

Names should communicate behavior and intent, not local shorthand or temporary context.

**Avoid:** opaque names that require external tribal knowledge.

**Prefer:** names that make call sites self-explanatory.

---

### M3.2 Follow Tag Start Rules

**Impact: HIGH (Invalid tag forms create portability and parser failures)**

Use ASCII letters or `%` initially, followed by letters or digits, for the portable convention. YottaDB also accepts all-digit labels; labels are distinct from routine names. Check the target dialect and project convention before allowing them.

Do not create alphanumeric tags that begin with a digit.

---

### M3.3 Include Tag Parentheses

**Impact: LOW (House policy; assess demonstrated compatibility or caller harm separately)**

House policy: use parentheses for new callable tags, including no-argument tags, unless entry-point constraints require otherwise. This is not a universal syntax requirement; check callers before adding a formal parameter list to an existing tag.

**Prefer (extrinsic function, called as `$$GetData()`):**
```m
GetData()
  quit "example"
```

---

### M3.4 Maintain Routine and Tag Headers

**Impact: LOW (House policy; assess demonstrated compatibility or caller harm separately)**

Maintain routine/tag headers with purpose, module/context, and revision notes. Keep headers synchronized with current behavior.

Header updates are required when changing public tag behavior or parameter contracts.

## Does Not Cover

- Variable scoping and symbol-table safety (see SafetyPatterns).
- Data access patterns and global hygiene (see SafetyPatterns).
- Locking and error trap behavior (see SafetyPatterns).

## Sources

- [YottaDB names, labels, parameter passing](https://docs.yottadb.com/ProgrammersGuide/langfeat.html)
- [YottaDB commands](https://docs.yottadb.com/ProgrammersGuide/commands.html)
- [IRIS 2026.2 identifier rules](https://docs.intersystems.com/irislatest/csp/docbook/DocBook.UI.Page.cls?KEY=RCOS_appx_identifiers)

Public language documentation does not verify proprietary Chronicles conventions; confirm those against the actual project contract.
