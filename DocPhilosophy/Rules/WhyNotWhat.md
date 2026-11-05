### Why, Not What

**Source:** Michael Nygard, "Documenting Architecture Decisions" (2011); 18F Documentation Guide (2020); Robert C. Martin, "Clean Code" (2008)

**Impact: HIGH — the single most common documentation mistake is documenting the wrong layer**

> Preserve the rationale that code cannot explain. Avoid comments that merely narrate obvious implementation, while keeping the API reference, operational steps and tutorials that readers need to use the system.

---

## The Two Layers

| Layer | Expressed By | Example |
|-------|-------------|---------|
| **What / How** | Code for implementation detail; accessible reference and task guidance for consumers | `users.filter(u => u.active && u.lastLogin > cutoff)` or the API's documented filtering contract |
| **Why** | Comments, ADRs, commit messages | "Filter inactive users to comply with GDPR data minimization (Art. 5(1)(c))" |

The relevant code version is evidence of implemented behavior, not proof of the intended or deployed contract. Consumers may need reference or operational guidance without reading implementation. Preserve rationale as well: why this approach, what was rejected, which constraints shaped the decision, and when to revisit.

Restating a self-evident line in an adjacent comment adds little. Explaining a public contract or a user's task can be necessary even when code implements it. Choose placement by the reader's need and the maintenance path; do not remove useful reference material merely because it describes behavior.

---

## Problem: Restating the Obvious

```python
# Get the user from the database
user = db.get_user(user_id)

# Check if user is active
if user.is_active:
    # Send welcome email
    send_welcome_email(user.email)

# Return the user
return user
```

Every comment restates what the code says. The reader gains nothing. These comments will drift from the code and become lies.

---

## Solution: Documenting Intent

```python
user = db.get_user(user_id)

# Only active users receive welcome emails — deactivated accounts
# are in a 30-day grace period and shouldn't receive new comms
# (see compliance decision in docs/decisions/014-deactivation-comms.md)
if user.is_active:
    send_welcome_email(user.email)

return user
```

The comment explains *why* the active check exists — a business rule invisible in the code. It links to the ADR for full context.

---

## Architecture Decision Records

ADRs are the purest expression of "why, not what." Michael Nygard's format:

```markdown
# ADR-014: Deactivated accounts receive no communications

## Status
Accepted (2024-03-15)

## Context
Legal review determined that deactivated accounts are in a GDPR
deletion pipeline. Sending communications creates compliance risk.

## Decision
No automated communications to accounts with is_active=false.

## Consequences
- Marketing cannot re-engage deactivated users via email
- Reduces compliance risk surface
- Simplifies the notification pipeline
```

**Properties:** Immutable (never edit accepted ADRs — write a new one to supersede). Append-only (decision history is valuable). In the repo (survives with the codebase).

---

## The What/Why Litmus Test

| Question | If YES | If NO |
|----------|--------|-------|
| Could the code express this? | Let the code speak — improve naming instead | Document it |
| Does this explain a decision? | ADR or inline *why* comment | Probably unnecessary |
| Will this be outdated if code changes? | It's restating *what* — delete it | It captures durable *why* |

---

## Commit Messages: Another Why Channel

```
# BAD: Restates the diff
"Changed timeout from 30s to 60s"

# GOOD: Explains why
"Increase timeout to 60s — downstream payment processor
occasionally exceeds 30s during peak hours (see incident #428)"
```

The diff shows *what* changed. The commit message's job is *why*.

---

## The Test Question

**"If I read only the code (no comments, no docs), what information would I be missing?"**

Capture the missing rationale. Also retain behavior, procedures and examples the intended reader needs to use the system; these are not noise merely because an expert could reconstruct them from code.
