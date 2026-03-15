# Charts & Data Visualization Accessibility

Reference guide for making data visualizations accessible. Use when building dashboards, reports, or any interface with charts and graphs.

## Chart Type Selection

| Data Type | Recommended Chart | Why |
|-----------|------------------|-----|
| Trends over time | Line chart | Shows continuous change |
| Part-to-whole | Pie/donut (≤5 segments) or stacked bar | Shows proportions |
| Comparison | Bar chart (horizontal for many items) | Easy to compare lengths |
| Distribution | Histogram or box plot | Shows spread and outliers |
| Correlation | Scatter plot | Shows relationships |
| Geographic | Choropleth map with data table | Spatial patterns |
| Ranking | Horizontal bar (sorted) | Natural top-to-bottom reading |

**Rule of thumb:** If you need more than 5 pie segments, switch to a bar chart.

---

## Color Accessibility in Charts

### Requirements

| Requirement | Implementation |
|-------------|----------------|
| Never rely on color alone | Add patterns, labels, or icons to distinguish series |
| Minimum contrast | 3:1 against adjacent colors and background |
| Colorblind-safe palettes | Test with deuteranopia, protanopia, tritanopia simulators |
| Dark mode support | Ensure colors work on both light and dark backgrounds |

### Colorblind-Safe Techniques

```
✓ Use patterns (hatching, dots, stripes) in addition to color
✓ Label data points directly instead of using a separate legend
✓ Use shapes (circle, square, triangle) for scatter plot series
✓ Ensure sufficient lightness contrast between adjacent colors
✗ Don't rely on red/green distinction (8% of males are red-green colorblind)
✗ Don't use only color to indicate error/success states in charts
```

### Direct Labeling vs Legend

```
✓ PREFERRED: Labels directly on or next to data series
  - Reduces cognitive load (no legend lookup)
  - Works without color perception
  - Accessible to screen readers when using aria-label

✗ AVOID: Color-only legend far from data
  - Requires matching colors across distance
  - Fails for colorblind users
  - Screen readers cannot associate colors with meaning
```

---

## Table Alternatives

**Every chart MUST have an accessible data alternative.** Screen readers cannot interpret visual charts.

### Implementation Options

| Approach | When to Use | Implementation |
|----------|-------------|----------------|
| Data table below chart | Always available | `<table>` with `<caption>` |
| Expandable data table | Space-constrained | `<details><summary>View data</summary><table>...</table></details>` |
| aria-describedby summary | Simple charts | Text description of key findings |
| Download CSV | Large datasets | Link to downloadable data file |

### Example: Chart with Data Table

```html
<figure>
  <img
    src="/chart-monthly-sales.svg"
    alt="Bar chart showing monthly sales for 2025"
    aria-describedby="sales-summary"
  >
  <figcaption id="sales-summary">
    Sales grew 23% from January ($45K) to December ($55K),
    with peak sales in November ($62K) during holiday season.
  </figcaption>

  <details>
    <summary>View sales data table</summary>
    <table>
      <caption>Monthly Sales 2025 (in thousands)</caption>
      <thead>
        <tr><th scope="col">Month</th><th scope="col">Sales ($K)</th></tr>
      </thead>
      <tbody>
        <tr><td>January</td><td>45</td></tr>
        <tr><td>February</td><td>42</td></tr>
        <!-- ... -->
      </tbody>
    </table>
  </details>
</figure>
```

### Example: Interactive Chart Component

```tsx
interface ChartProps {
  data: DataPoint[];
  title: string;
  summary: string;
}

function AccessibleChart({ data, title, summary }: ChartProps) {
  const tableId = useId();

  return (
    <figure role="figure" aria-label={title}>
      {/* Visual chart */}
      <div aria-hidden="true" className="chart-container">
        <BarChart data={data} />
      </div>

      {/* Accessible summary */}
      <figcaption>{summary}</figcaption>

      {/* Full data access */}
      <details>
        <summary>View underlying data</summary>
        <table id={tableId}>
          <caption>{title}</caption>
          <thead>
            <tr>
              {Object.keys(data[0]).map(key => (
                <th key={key} scope="col">{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                {Object.values(row).map((val, j) => (
                  <td key={j}>{String(val)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
```

---

## SVG Chart Accessibility

When building charts with SVG:

```html
<svg role="img" aria-labelledby="chart-title chart-desc">
  <title id="chart-title">Monthly Revenue 2025</title>
  <desc id="chart-desc">
    Bar chart showing revenue increasing from $45K in January
    to $55K in December, with a peak of $62K in November.
  </desc>

  <!-- Chart elements -->
  <g role="list" aria-label="Revenue by month">
    <rect role="listitem" aria-label="January: $45,000" ... />
    <rect role="listitem" aria-label="February: $42,000" ... />
  </g>
</svg>
```

---

## Testing Checklist

| Test | Method |
|------|--------|
| Colorblind simulation | Chrome DevTools → Rendering → Emulate vision deficiencies |
| Screen reader | Navigate chart with NVDA/VoiceOver — key data accessible? |
| Data table | Expand table alternative — data matches chart? |
| Keyboard | Tab to chart area — can data be explored? |
| High contrast | Windows High Contrast mode — chart still readable? |
| Zoom | 200% zoom — chart and table still usable? |

---

## WCAG Success Criteria

| Criterion | Level | Requirement |
|-----------|-------|-------------|
| 1.1.1 Non-text Content | A | Charts have text alternatives |
| 1.4.1 Use of Color | A | Color not sole means of conveying info |
| 1.4.11 Non-text Contrast | AA | Chart elements have 3:1 contrast |
| 1.3.1 Info and Relationships | A | Data table has proper structure |
