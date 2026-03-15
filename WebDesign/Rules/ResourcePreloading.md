# Resource Preloading

## Impact: MEDIUM (Load Performance)

Resource hints tell the browser to start loading critical assets before it discovers them through parsing. Without preconnect, the browser waits until it encounters a CDN URL to start DNS+TLS negotiation. Without font preloading, text renders in a fallback font then flashes when the web font arrives. These hints cost nothing at build time but shave hundreds of milliseconds off perceived load time.

---

## Requirements Summary

| Requirement | Implementation | Impact |
|-------------|----------------|--------|
| Preconnect CDN domains | `<link rel="preconnect" href="https://cdn.example.com">` | Early DNS+TLS |
| Preload critical fonts | `<link rel="preload" as="font" type="font/woff2" crossorigin>` | Faster text render |
| Font-display swap | `font-display: swap` in @font-face | Text visible immediately |
| Preload hero image | `<link rel="preload" as="image">` for LCP image | Faster LCP |
| DNS-prefetch fallback | `<link rel="dns-prefetch">` for non-critical domains | Broad browser support |

---

## Code Examples

### Preconnect to CDN

#### Incorrect

```html
<head>
  <!-- No preconnect — browser discovers CDN domain late -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter">
  <!-- DNS + TLS negotiation starts only when browser parses this line -->
</head>
```

#### Correct

```html
<head>
  <!-- Preconnect starts DNS + TLS immediately -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preconnect" href="https://cdn.example.com">

  <!-- DNS-prefetch as fallback for older browsers -->
  <link rel="dns-prefetch" href="https://analytics.example.com">

  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter">
</head>
```

```tsx
// Next.js head component
import Head from 'next/head';

function DocumentHead() {
  return (
    <Head>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href={process.env.NEXT_PUBLIC_CDN_URL} />
    </Head>
  );
}
```

### Font Preloading

#### Incorrect

```css
/* Font loads late — FOIT (Flash of Invisible Text) or FOUT (Flash of Unstyled Text) */
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom.woff2') format('woff2');
  /* No font-display — text invisible until font loads */
}
```

#### Correct

```html
<!-- Preload critical font in <head> -->
<link
  rel="preload"
  href="/fonts/custom.woff2"
  as="font"
  type="font/woff2"
  crossorigin
>
```

```css
/* font-display: swap shows fallback text immediately */
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom.woff2') format('woff2');
  font-display: swap; /* Show fallback font immediately, swap when loaded */
}
```

```tsx
// Next.js font optimization (automatic preloading)
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Ensures font-display: swap
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
```

### Preload Hero/LCP Image

#### Correct

```html
<head>
  <!-- Preload the LCP image so browser fetches it early -->
  <link
    rel="preload"
    href="/images/hero.webp"
    as="image"
    type="image/webp"
  >

  <!-- Responsive preload with media queries -->
  <link
    rel="preload"
    href="/images/hero-mobile.webp"
    as="image"
    type="image/webp"
    media="(max-width: 768px)"
  >
  <link
    rel="preload"
    href="/images/hero-desktop.webp"
    as="image"
    type="image/webp"
    media="(min-width: 769px)"
  >
</head>
```

---

## Testing Guidance

### Manual Testing

1. **Network waterfall**: Open DevTools Network tab — preconnected domains should show early DNS/TLS
2. **Font loading**: Throttle to Slow 3G — text should appear immediately in fallback font, then swap
3. **LCP timing**: Run Lighthouse — hero image should load before or with CSS/JS
4. **Coverage**: Check that all third-party domains used in the page have preconnect hints

### Anti-Patterns to Flag

```
Third-party CDN without preconnect       → Add <link rel="preconnect">
@font-face without font-display          → Add font-display: swap
Hero image without preload               → Add <link rel="preload" as="image">
Too many preconnects (>4)                → Prioritize critical domains only
```

---

## References

| Topic | Source |
|-------|--------|
| Resource hints | [web.dev Preconnect](https://web.dev/uses-rel-preconnect/) |
| Font loading | [web.dev Font best practices](https://web.dev/font-best-practices/) |
| Preload scanner | [MDN Preload](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/preload) |
