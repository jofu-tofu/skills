# Plain Language & Content Copy

## Impact: MEDIUM

Complex language creates barriers for users with cognitive disabilities, non-native speakers, and those with reading difficulties. Clear communication benefits everyone and improves comprehension across all user groups.

## Why It Matters

Approximately 54% of US adults read below a 6th-grade level. Technical jargon, undefined acronyms, and complex sentence structures exclude millions of users. Plain language is not "dumbing down" content; it is making information accessible to the widest possible audience. Legal and medical fields have shown that plain language improves compliance and reduces errors.

---

## Rule 1: Use Clear, Simple Language

### Incorrect - Jargon-Heavy Content

```html
<p>
  Utilize the aforementioned functionality to facilitate the
  implementation of user-centric paradigms in accordance with
  established protocols.
</p>

<p>
  The system will leverage machine learning algorithms to
  effectuate predictive analytics capabilities.
</p>
```

### Correct - Plain Language

```html
<p>
  Use this feature to help create designs that work well for users.
</p>

<p>
  The system uses pattern recognition to predict what might
  happen next.
</p>
```

```tsx
// Error messages in plain language
// Incorrect
const TechnicalError = () => (
  <div role="alert">
    Error: HTTP 403 - Authorization token validation failed.
    Re-authenticate via SSO provider.
  </div>
);

// Correct
const PlainError = () => (
  <div role="alert">
    <strong>Access denied</strong>
    <p>You do not have permission to view this page.
       Please sign in again or contact your administrator.</p>
  </div>
);
```

---

## Rule 2: Define Acronyms and Abbreviations

### Incorrect - Undefined Acronyms

```html
<p>Use the API to connect to our SaaS platform via OAuth.</p>

<p>The ROI depends on your KPIs and OKRs.</p>
```

### Correct - Defined Abbreviations Using abbr Element

```html
<p>
  Use the <abbr title="Application Programming Interface">API</abbr>
  to connect to our
  <abbr title="Software as a Service">SaaS</abbr> platform via
  <abbr title="Open Authorization">OAuth</abbr>.
</p>

<!-- First use expanded, subsequent uses can be abbreviated -->
<p>
  The Application Programming Interface (API) allows your app to
  communicate with our servers. The API documentation includes
  code examples.
</p>
```

```tsx
// Reusable abbreviation component
interface AbbrProps {
  title: string;
  children: React.ReactNode;
}

function Abbreviation({ title, children }: AbbrProps) {
  return (
    <abbr
      title={title}
      style={{
        textDecoration: 'underline dotted',
        cursor: 'help'
      }}
    >
      {children}
    </abbr>
  );
}

// Usage
function TechContent() {
  return (
    <p>
      Connect your <Abbreviation title="Application Programming Interface">API</Abbreviation> using
      <Abbreviation title="Open Authorization">OAuth</Abbreviation> 2.0.
    </p>
  );
}
```

---

## Rule 3: Identify Language Changes

### Incorrect - Unmarked Language Changes

```html
<p>
  The concept of hygge from Danish culture emphasizes coziness.
</p>

<p>
  Our motto is carpe diem - seize every opportunity.
</p>
```

### Correct - Language Marked with lang Attribute

```html
<!-- Document language set on html element -->
<html lang="en">

<!-- Foreign phrases marked with lang attribute -->
<p>
  The concept of <span lang="da">hygge</span> from Danish culture
  emphasizes coziness.
</p>

<p>
  Our motto is <span lang="la">carpe diem</span> - seize every opportunity.
</p>

<!-- Longer foreign content -->
<blockquote lang="fr">
  <p>Liberté, égalité, fraternité</p>
  <cite>— French national motto</cite>
</blockquote>
```

```tsx
// Component handling language changes
interface ForeignPhraseProps {
  lang: string;
  phrase: string;
  translation?: string;
}

function ForeignPhrase({ lang, phrase, translation }: ForeignPhraseProps) {
  return (
    <>
      <span lang={lang}>{phrase}</span>
      {translation && <span className="translation"> ({translation})</span>}
    </>
  );
}

// Usage
function Content() {
  return (
    <p>
      The Japanese concept of <ForeignPhrase
        lang="ja"
        phrase="wabi-sabi"
        translation="finding beauty in imperfection"
      /> influences our design philosophy.
    </p>
  );
}
```

---

## Rule 4: Consider Reading Level

### Incorrect - Complex Sentence Structure

```html
<p>
  Notwithstanding the previously enumerated considerations, it
  behooves the user to exercise due diligence in the verification
  of the accuracy of the information contained herein, inasmuch as
  the organization shall not be held liable for any discrepancies
  that may arise therefrom.
</p>
```

### Correct - Clear Sentence Structure

```html
<p>
  Please check that this information is correct. We are not
  responsible for errors.
</p>

<!-- Break complex ideas into digestible pieces -->
<div>
  <h3>Before you continue</h3>
  <ul>
    <li>Check that your information is correct</li>
    <li>Save a copy for your records</li>
    <li>Contact us if you find any errors</li>
  </ul>
</div>
```

```tsx
// Instructions component with clear structure
function Instructions({ steps }: { steps: string[] }) {
  return (
    <div className="instructions">
      <h3>How to complete this form</h3>
      <ol>
        {steps.map((step, index) => (
          <li key={index}>{step}</li>
        ))}
      </ol>
    </div>
  );
}

// Usage with plain language steps
<Instructions steps={[
  "Enter your name and email",
  "Choose a password (at least 8 characters)",
  "Click 'Create Account'",
  "Check your email for a confirmation link",
]} />
```

---

## Rule 5: Provide Summaries for Complex Content

### Incorrect - Dense Technical Content Without Summary

```html
<article>
  <h2>Privacy Policy</h2>
  <p>
    This Privacy Policy describes how Company X collects, uses,
    and shares personal information... [2000 words of legal text]
  </p>
</article>
```

### Correct - Summary Before Complex Content

```html
<article>
  <h2>Privacy Policy</h2>

  <section aria-label="Summary">
    <h3>Key Points</h3>
    <ul>
      <li>We collect your name, email, and usage data</li>
      <li>We use this data to improve our service</li>
      <li>We never sell your data to third parties</li>
      <li>You can delete your data at any time</li>
    </ul>
  </section>

  <section aria-label="Full policy">
    <h3>Full Privacy Policy</h3>
    <p>This Privacy Policy describes...</p>
  </section>
</article>
```

```tsx
// Component for complex content with summary
interface ComplexContentProps {
  title: string;
  summary: string[];
  fullContent: React.ReactNode;
}

function ComplexContent({ title, summary, fullContent }: ComplexContentProps) {
  return (
    <article>
      <h2>{title}</h2>

      <section aria-labelledby="summary-heading">
        <h3 id="summary-heading">Summary</h3>
        <ul>
          {summary.map((point, i) => (
            <li key={i}>{point}</li>
          ))}
        </ul>
      </section>

      <details>
        <summary>Read full {title.toLowerCase()}</summary>
        {fullContent}
      </details>
    </article>
  );
}
```

---

## Testing Guidance

### Manual Testing
1. Read content aloud - does it sound natural?
2. Have someone unfamiliar with the subject review it
3. Use readability scoring tools (Flesch-Kincaid, SMOG)

### Screen Reader Testing
- Verify abbreviations are announced with expansions
- Check language changes trigger correct pronunciation
- Confirm document language is declared

### Automated Testing

```javascript
// Test for lang attribute on html element
test('document has language defined', () => {
  const { container } = render(<App />);
  expect(document.documentElement).toHaveAttribute('lang');
});

// Test abbreviations have title
test('abbreviations have expansions', () => {
  const { container } = render(<TechContent />);
  const abbrs = container.querySelectorAll('abbr');

  abbrs.forEach(abbr => {
    expect(abbr).toHaveAttribute('title');
    expect(abbr.getAttribute('title')).not.toBe('');
  });
});

// Test for foreign language marking
test('foreign phrases have lang attribute', () => {
  const { container } = render(<InternationalContent />);
  const foreignPhrases = container.querySelectorAll('[lang]');

  foreignPhrases.forEach(phrase => {
    // Verify it's not the document language
    expect(phrase.getAttribute('lang')).not.toBe('en');
  });
});

// Custom readability check (simplified)
function assessReadability(text: string): number {
  const sentences = text.split(/[.!?]+/).length;
  const words = text.split(/\s+/).length;
  const syllables = countSyllables(text); // Implementation needed

  // Flesch-Kincaid Grade Level
  return 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59;
}

test('content is at appropriate reading level', () => {
  const text = screen.getByRole('article').textContent;
  const gradeLevel = assessReadability(text);

  expect(gradeLevel).toBeLessThanOrEqual(8); // 8th grade or below
});
```

---

## WCAG Success Criteria

| Criterion | Level | Description |
|-----------|-------|-------------|
| **3.1.1 Language of Page** | A | Default language identified in code |
| **3.1.2 Language of Parts** | AA | Language changes identified in code |
| **3.1.3 Unusual Words** | AAA | Mechanism for definitions |
| **3.1.4 Abbreviations** | AAA | Mechanism for abbreviation expansion |
| **3.1.5 Reading Level** | AAA | Supplemental content for complex text |

---

## Content Copy Guidelines

### Writing Style

| Guideline | Example |
|-----------|---------|
| Active voice | "Install the CLI" not "The CLI will be installed" |
| Second person | "You can configure..." not "Users can configure..." |
| Title Case for headings/buttons | Chicago style capitalization |
| Numerals for counts | "8 deployments" not "eight deployments" |
| Specific button labels | "Save API Key" not "Continue" |
| `&` over "and" | Where space-constrained (buttons, tabs) |

### Error Messages Include Fix

#### Incorrect

```
Error: HTTP 403 — Authorization failed.
```

#### Correct

```
Access denied. Sign in again or contact your administrator.
```

Error messages must always include the next step the user should take, not just describe the problem.

---

## Plain Language Checklist

| Principle | Implementation |
|-----------|----------------|
| Short sentences | Aim for 15-20 words average |
| Common words | Use "use" not "utilize" |
| Active voice | "We will contact you" not "You will be contacted" |
| Defined acronyms | Use `<abbr>` with `title` |
| Marked language | Use `lang` attribute for foreign text |
| Summaries | Provide key points before complex content |
| Lists | Break down steps and options |
| Headings | Use descriptive, hierarchical headings |
