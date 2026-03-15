# International Formatting

## Impact: MEDIUM (Global Usability)

Hardcoded date, number, and currency formats break for international users. "01/02/2025" means January 2nd in the US but February 1st in most of the world. "$1,234.56" uses periods for thousands in some locales. The `Intl` API handles locale-aware formatting natively in all browsers — there is no reason to hardcode formats or use locale-unaware string manipulation.

---

## Requirements Summary

| Requirement | Implementation | Impact |
|-------------|----------------|--------|
| Dates and times | `Intl.DateTimeFormat` | Locale-correct formatting |
| Numbers and currency | `Intl.NumberFormat` | Correct separators/symbols |
| Language detection | `Accept-Language` header or `navigator.languages` | Automatic locale |
| No IP-based detection | Never infer language from IP address | Incorrect for VPN/travel |
| No hardcoded formats | Never use string templates for dates/numbers | Breaks internationally |
| Relative time | `Intl.RelativeTimeFormat` | "2 hours ago" localized |

---

## Code Examples

### Date Formatting

#### Incorrect

```typescript
// Hardcoded US date format — wrong for most of the world
function formatDate(date: Date): string {
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  // 01/02/2025 — January 2 in US, February 1 elsewhere
}

// String interpolation — not locale-aware
function formatDateTime(date: Date): string {
  return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
  // Inconsistent across browsers without explicit locale
}
```

#### Correct

```typescript
// Intl.DateTimeFormat — locale-aware, consistent
function formatDate(date: Date, locale?: string): string {
  return new Intl.DateTimeFormat(locale ?? navigator.language, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
  // "January 2, 2025" (en-US) / "2 January 2025" (en-GB) / "2025年1月2日" (ja)
}

function formatDateTime(date: Date, locale?: string): string {
  return new Intl.DateTimeFormat(locale ?? navigator.language, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

// Relative time
function formatRelativeTime(date: Date, locale?: string): string {
  const rtf = new Intl.RelativeTimeFormat(locale ?? navigator.language, {
    numeric: 'auto',
  });

  const diffMs = date.getTime() - Date.now();
  const diffHours = Math.round(diffMs / 3600000);
  const diffDays = Math.round(diffMs / 86400000);

  if (Math.abs(diffHours) < 24) return rtf.format(diffHours, 'hour');
  return rtf.format(diffDays, 'day');
  // "2 hours ago" / "yesterday" / "in 3 days"
}
```

### Number and Currency Formatting

#### Incorrect

```typescript
// Hardcoded separators — wrong in many locales
function formatPrice(amount: number): string {
  return '$' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  // $1,234.56 — but Germany uses 1.234,56 €
}

// String concatenation for currency
function formatCurrency(amount: number, currency: string): string {
  return `${currency} ${amount.toFixed(2)}`;
  // "EUR 1234.56" — wrong format, wrong position
}
```

#### Correct

```typescript
// Intl.NumberFormat — handles separators, symbols, position
function formatPrice(amount: number, currency: string, locale?: string): string {
  return new Intl.NumberFormat(locale ?? navigator.language, {
    style: 'currency',
    currency,
  }).format(amount);
  // "$1,234.56" (en-US) / "1.234,56 €" (de-DE) / "¥1,235" (ja-JP)
}

// Plain number formatting
function formatNumber(value: number, locale?: string): string {
  return new Intl.NumberFormat(locale ?? navigator.language).format(value);
  // "1,234,567" (en) / "1.234.567" (de) / "12,34,567" (hi-IN)
}

// Compact notation
function formatCompact(value: number, locale?: string): string {
  return new Intl.NumberFormat(locale ?? navigator.language, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
  // "1.2K" (en) / "1,2 Tsd." (de)
}
```

### Language Detection

#### Incorrect

```typescript
// IP-based detection — wrong for VPN, travelers, expats
async function detectLanguage(ip: string): Promise<string> {
  const geo = await geoLookup(ip);
  return countryToLanguage(geo.country);
  // User in Japan using US VPN → gets Japanese
}
```

#### Correct

```typescript
// Server: use Accept-Language header
function getLocaleFromRequest(request: Request): string {
  const acceptLanguage = request.headers.get('Accept-Language');
  if (!acceptLanguage) return 'en';

  // Parse quality values: "en-US,en;q=0.9,de;q=0.8"
  const locales = acceptLanguage
    .split(',')
    .map(part => {
      const [locale, q] = part.trim().split(';q=');
      return { locale: locale.trim(), quality: q ? parseFloat(q) : 1 };
    })
    .sort((a, b) => b.quality - a.quality);

  return locales[0]?.locale ?? 'en';
}

// Client: use navigator.languages
function getClientLocale(): string {
  return navigator.languages?.[0] ?? navigator.language ?? 'en';
}
```

---

## Testing Guidance

### Manual Testing

1. **Locale switching**: Change browser language — dates and numbers should reformat
2. **Edge cases**: Test with Arabic (RTL), Japanese (no spaces), Hindi (lakhs grouping)
3. **Currency**: Verify EUR appears as "€" not "EUR" in formatted output
4. **Hardcoded check**: Search codebase for `.toFixed(`, template literals with `/`, manual comma insertion

### Anti-Patterns to Flag

```
.toFixed(2) for currency display     → Use Intl.NumberFormat with style: 'currency'
MM/DD/YYYY string templates          → Use Intl.DateTimeFormat
IP geolocation for language           → Use Accept-Language or navigator.languages
Hardcoded $ or € symbols             → Use Intl.NumberFormat currency option
Manual thousand separator regex       → Use Intl.NumberFormat
```

---

## References

| Topic | Source |
|-------|--------|
| Intl API | [MDN Intl](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl) |
| DateTimeFormat | [MDN DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat) |
| NumberFormat | [MDN NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat) |
