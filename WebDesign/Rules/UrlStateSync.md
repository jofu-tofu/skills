# URL State Synchronization

## Impact: MEDIUM (Shareability & UX)

When UI state lives only in component state (`useState`), users cannot share, bookmark, or navigate back to a specific view. Filters, tabs, pagination, search queries, expanded panels, and sort orders should be reflected in the URL. This enables deep-linking, browser back/forward navigation, and link sharing — all core web platform expectations that single-page apps frequently break.

---

## Requirements Summary

| Requirement | Implementation | Impact |
|-------------|----------------|--------|
| URL reflects UI state | Query params for filters, tabs, pagination, sort | Shareable URLs |
| Deep-link all stateful UI | Any `useState` that changes the view should sync to URL | Bookmark support |
| Back/forward navigation | URL changes on state change, state restores on URL change | Browser nav works |
| Server-readable state | Query params parseable on server for SSR | SEO + sharing |
| Default values omitted | Don't pollute URL with default state | Clean URLs |

---

## Code Examples

### State in URL vs Component

#### Incorrect

```tsx
// State trapped in component — URL stays the same regardless of view
function ProductList() {
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('popular');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  // URL: /products (always the same)
  // User cannot share "electronics sorted by price on page 3"
  return (
    <div>
      <Filters category={category} onCategoryChange={setCategory} />
      <SortControl sort={sort} onSortChange={setSort} />
      <SearchBar value={search} onChange={setSearch} />
      <ProductGrid category={category} sort={sort} page={page} search={search} />
      <Pagination page={page} onPageChange={setPage} />
    </div>
  );
}
```

#### Correct

```tsx
// State synchronized with URL query parameters
import { useSearchParams } from 'next/navigation';

function ProductList() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read state from URL
  const category = searchParams.get('category') ?? 'all';
  const sort = searchParams.get('sort') ?? 'popular';
  const page = Number(searchParams.get('page') ?? '1');
  const search = searchParams.get('q') ?? '';

  // URL: /products?category=electronics&sort=price&page=3&q=laptop
  // Shareable, bookmarkable, back/forward works

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div>
      <Filters
        category={category}
        onCategoryChange={c => updateParams({ category: c === 'all' ? null : c, page: '1' })}
      />
      <SortControl
        sort={sort}
        onSortChange={s => updateParams({ sort: s === 'popular' ? null : s })}
      />
      <SearchBar
        defaultValue={search}
        onSearch={q => updateParams({ q: q || null, page: '1' })}
      />
      <ProductGrid category={category} sort={sort} page={page} search={search} />
      <Pagination
        page={page}
        onPageChange={p => updateParams({ page: p === 1 ? null : String(p) })}
      />
    </div>
  );
}
```

### Tab State in URL

#### Incorrect

```tsx
// Active tab lost on refresh or share
function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  // URL: /settings (always)
  return <Tabs active={activeTab} onChange={setActiveTab} />;
}
```

#### Correct

```tsx
// Active tab preserved in URL
function SettingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get('tab') ?? 'general';

  const setActiveTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === 'general') {
      params.delete('tab'); // Omit default value
    } else {
      params.set('tab', tab);
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // URL: /settings?tab=security
  return <Tabs active={activeTab} onChange={setActiveTab} />;
}
```

### Clean URL Pattern — Omit Defaults

#### Correct

```tsx
// Only non-default values appear in URL
function buildQueryString(state: FilterState, defaults: FilterState): string {
  const params = new URLSearchParams();

  Object.entries(state).forEach(([key, value]) => {
    if (value !== defaults[key as keyof FilterState] && value !== '' && value != null) {
      params.set(key, String(value));
    }
  });

  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

// Default view: /products (clean)
// Filtered view: /products?category=electronics&sort=price
// Not: /products?category=electronics&sort=price&page=1&q=&view=grid
```

---

## Testing Guidance

### Manual Testing

1. **Share test**: Copy URL, open in new tab — same view should appear
2. **Back button**: Change filters, click back — previous filter state should restore
3. **Bookmark test**: Bookmark a filtered/paginated view, reopen — state preserved
4. **Default URL**: With all defaults selected, URL should have no query params

### Anti-Patterns to Flag

```
useState for filters/tabs/pagination   → Sync to URL query params
URL stays same regardless of view      → Add query param synchronization
Default values in URL                  → Omit defaults for clean URLs
Hash-based state (#tab=foo)            → Use query params for SSR compatibility
```

---

## References

| Topic | Source |
|-------|--------|
| nuqs library | Type-safe URL state management for Next.js |
| URLSearchParams | [MDN URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) |
| Next.js routing | [Next.js useSearchParams](https://nextjs.org/docs/app/api-reference/functions/use-search-params) |
