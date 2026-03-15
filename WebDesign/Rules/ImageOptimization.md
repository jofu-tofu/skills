# Image Optimization

## Impact: HIGH (Performance & CLS)

Unoptimized images are the single largest contributor to slow page loads and layout shift. Images without explicit dimensions cause Cumulative Layout Shift (CLS) as the browser recalculates layout once the image loads. Missing lazy loading forces below-fold images to load immediately, blocking critical resources. Using modern formats and responsive images reduces bandwidth by 30-80%.

---

## Requirements Summary

| Requirement | Implementation | Impact |
|-------------|----------------|--------|
| Explicit dimensions | `width` and `height` attributes on every `<img>` | Prevents CLS |
| Lazy loading | `loading="lazy"` on below-fold images | Reduces initial load |
| Fetch priority | `fetchpriority="high"` on above-fold hero images | Faster LCP |
| Modern formats | WebP or AVIF with fallback | 30-80% smaller files |
| Responsive images | `srcset` and `sizes` attributes | Device-appropriate sizing |
| Aspect ratio | CSS `aspect-ratio` as backup for dimensions | Reserves space |

---

## Code Examples

### Image Dimensions

#### Incorrect

```html
<!-- No dimensions — causes layout shift when image loads -->
<img src="/hero.jpg" alt="Product showcase">

<!-- Width only — height unknown, still causes CLS -->
<img src="/hero.jpg" alt="Product showcase" width="800">
```

#### Correct

```html
<!-- Explicit width and height prevent CLS -->
<img
  src="/hero.jpg"
  alt="Product showcase"
  width="800"
  height="450"
>

<!-- CSS can override display size while maintaining aspect ratio -->
<img
  src="/hero.jpg"
  alt="Product showcase"
  width="800"
  height="450"
  style="width: 100%; height: auto;"
>
```

```tsx
// React/Next.js optimized image
import Image from 'next/image';

function HeroImage() {
  return (
    <Image
      src="/hero.jpg"
      alt="Product showcase"
      width={800}
      height={450}
      priority  // Above-fold: skip lazy loading
    />
  );
}
```

### Lazy Loading

#### Incorrect

```html
<!-- All images load immediately regardless of viewport position -->
<img src="/section-1.jpg" alt="..." width="600" height="400">
<img src="/section-2.jpg" alt="..." width="600" height="400">
<img src="/section-3.jpg" alt="..." width="600" height="400">
<!-- Bottom-of-page images block initial render -->
```

#### Correct

```html
<!-- Above-fold: load eagerly with high priority -->
<img
  src="/hero.jpg"
  alt="Hero banner"
  width="1200"
  height="600"
  fetchpriority="high"
>

<!-- Below-fold: lazy load -->
<img
  src="/section-2.jpg"
  alt="Features overview"
  width="600"
  height="400"
  loading="lazy"
>

<img
  src="/section-3.jpg"
  alt="Testimonials"
  width="600"
  height="400"
  loading="lazy"
>
```

### Responsive Images with srcset

#### Correct

```html
<!-- Serve different sizes for different viewports -->
<img
  src="/product-800.jpg"
  srcset="
    /product-400.jpg 400w,
    /product-800.jpg 800w,
    /product-1200.jpg 1200w
  "
  sizes="(max-width: 480px) 100vw, (max-width: 1024px) 50vw, 33vw"
  alt="Product photo"
  width="800"
  height="600"
  loading="lazy"
>

<!-- Art direction with picture element -->
<picture>
  <source
    media="(max-width: 480px)"
    srcset="/hero-mobile.webp"
    type="image/webp"
  >
  <source
    media="(max-width: 480px)"
    srcset="/hero-mobile.jpg"
  >
  <source
    srcset="/hero-desktop.webp"
    type="image/webp"
  >
  <img
    src="/hero-desktop.jpg"
    alt="Product hero"
    width="1200"
    height="600"
  >
</picture>
```

### Modern Formats with Fallback

#### Correct

```html
<!-- WebP with JPEG fallback -->
<picture>
  <source srcset="/photo.avif" type="image/avif">
  <source srcset="/photo.webp" type="image/webp">
  <img src="/photo.jpg" alt="Team photo" width="800" height="600" loading="lazy">
</picture>
```

```tsx
// Next.js handles format negotiation automatically
import Image from 'next/image';

function OptimizedPhoto() {
  return (
    <Image
      src="/photo.jpg"
      alt="Team photo"
      width={800}
      height={600}
      // Next.js serves WebP/AVIF automatically based on Accept header
    />
  );
}
```

### CSS Aspect Ratio Backup

```css
/* Reserve space even before image loads */
.image-container {
  aspect-ratio: 16 / 9;
  overflow: hidden;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

---

## Testing Guidance

### Manual Testing

1. **CLS check**: Throttle network to Slow 3G, reload page — images should not cause layout shift
2. **Lazy loading**: Open Network tab, scroll down — below-fold images should load on scroll
3. **Format check**: Inspect Network tab — images should serve WebP/AVIF to supporting browsers
4. **LCP image**: Use Lighthouse — hero image should have fetchpriority="high"

### Anti-Patterns to Flag

```
<img> without width and height    → Add explicit dimensions
<img> without loading="lazy"      → Add lazy loading for below-fold
Hero image without fetchpriority  → Add fetchpriority="high"
JPEG/PNG without WebP fallback    → Use <picture> with modern formats
Large images without srcset       → Add responsive image sources
```

---

## WCAG Success Criteria

| Criterion | Level | Requirement |
|-----------|-------|-------------|
| [1.1.1 Non-text Content](https://www.w3.org/WAI/WCAG21/Understanding/non-text-content) | A | All images have appropriate alt text |
| [1.4.5 Images of Text](https://www.w3.org/WAI/WCAG21/Understanding/images-of-text) | AA | Use real text instead of images of text |
