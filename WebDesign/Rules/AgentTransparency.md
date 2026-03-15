# Agent Transparency

## Impact: MEDIUM

Opaque AI and agent interfaces create confusion and distrust. Users need to understand what the system is doing, why it made certain decisions, and where information comes from to make informed decisions.

## Why It Matters

AI-powered interfaces can feel like black boxes, leaving users uncertain about what is happening behind the scenes. This uncertainty affects users with cognitive disabilities more acutely, as unexpected behavior is harder to process. Transparent AI communication builds trust, reduces anxiety, and helps users understand and verify the information they receive. Clear processing states prevent users from thinking the interface is frozen or broken.

---

## Rule 1: Show Processing Status

### Incorrect - No Feedback During Processing

```tsx
// User sees nothing while AI processes
function ChatInterface() {
  const [response, setResponse] = useState('');

  const sendMessage = async (message: string) => {
    // No loading state - user waits with no feedback
    const result = await fetchAIResponse(message);
    setResponse(result);
  };

  return (
    <div>
      <input type="text" />
      <button onClick={() => sendMessage(inputValue)}>Send</button>
      <div>{response}</div>
    </div>
  );
}
```

### Correct - Clear Processing Indicators

```tsx
// Accessible loading state with progress indication
function ChatInterface() {
  const [status, setStatus] = useState<'idle' | 'thinking' | 'responding'>('idle');
  const [response, setResponse] = useState('');
  const statusRef = useRef<HTMLDivElement>(null);

  const sendMessage = async (message: string) => {
    setStatus('thinking');

    try {
      // Show different states for different phases
      setStatus('thinking');
      const result = await fetchAIResponse(message, {
        onStart: () => setStatus('responding'),
      });
      setResponse(result);
    } finally {
      setStatus('idle');
    }
  };

  return (
    <div>
      <input type="text" aria-describedby="status-message" />
      <button onClick={() => sendMessage(inputValue)}>Send</button>

      {/* Live region for status updates */}
      <div
        ref={statusRef}
        role="status"
        aria-live="polite"
        id="status-message"
      >
        {status === 'thinking' && (
          <p>
            <span className="spinner" aria-hidden="true" />
            Analyzing your question...
          </p>
        )}
        {status === 'responding' && (
          <p>
            <span className="spinner" aria-hidden="true" />
            Generating response...
          </p>
        )}
      </div>

      <div aria-live="polite">{response}</div>
    </div>
  );
}
```

```html
<!-- Detailed processing steps -->
<div role="status" aria-live="polite" aria-atomic="true">
  <h3 id="processing-status">Processing your request</h3>
  <ol aria-labelledby="processing-status">
    <li aria-current="step">Analyzing your question</li>
    <li>Searching knowledge base</li>
    <li>Generating response</li>
  </ol>
  <p>This usually takes 5-10 seconds.</p>
</div>
```

---

## Rule 2: Explain Reasoning When Helpful

### Incorrect - Opaque Recommendations

```html
<!-- No explanation for why these were recommended -->
<div class="recommendations">
  <h2>Recommended for you</h2>
  <ul>
    <li>Product A</li>
    <li>Product B</li>
    <li>Product C</li>
  </ul>
</div>
```

### Correct - Transparent Recommendations

```html
<section aria-labelledby="rec-heading">
  <h2 id="rec-heading">Recommended for you</h2>
  <p class="explanation">
    Based on your recent purchase of running shoes and your saved preferences.
  </p>

  <ul>
    <li>
      <article>
        <h3>Performance Running Socks</h3>
        <p class="reason">
          <span class="visually-hidden">Why recommended:</span>
          Frequently bought with running shoes
        </p>
      </article>
    </li>
  </ul>

  <details>
    <summary>How we choose recommendations</summary>
    <p>
      We recommend products based on your purchase history,
      saved preferences, and what similar customers bought.
      <a href="/settings/recommendations">Manage your preferences</a>
    </p>
  </details>
</section>
```

```tsx
// AI response with reasoning
interface AIResponseProps {
  answer: string;
  reasoning?: string;
  sources?: Source[];
  confidence?: number;
}

function AIResponse({ answer, reasoning, sources, confidence }: AIResponseProps) {
  return (
    <article className="ai-response" aria-labelledby="response-heading">
      <h3 id="response-heading" className="visually-hidden">AI Response</h3>

      <div className="answer">{answer}</div>

      {reasoning && (
        <details className="reasoning">
          <summary>Why this answer?</summary>
          <p>{reasoning}</p>
        </details>
      )}

      {confidence !== undefined && (
        <p className="confidence" aria-label={`Confidence level: ${confidence}%`}>
          <span aria-hidden="true">Confidence: {confidence}%</span>
        </p>
      )}

      {sources && sources.length > 0 && (
        <section aria-labelledby="sources-heading">
          <h4 id="sources-heading">Sources</h4>
          <ul>
            {sources.map((source, i) => (
              <li key={i}>
                <a href={source.url}>{source.title}</a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
```

---

## Rule 3: Cite Sources

### Incorrect - Unsourced Claims

```html
<div class="ai-response">
  <p>
    The population of Tokyo is 13.96 million people. It was
    founded in 1457 and has the world's busiest train station.
  </p>
</div>
```

### Correct - Properly Cited Information

```html
<div class="ai-response">
  <p>
    The population of Tokyo is 13.96 million people
    <sup><a href="#source-1" aria-label="Source 1">[1]</a></sup>.
    It was founded in 1457
    <sup><a href="#source-2" aria-label="Source 2">[2]</a></sup>.
  </p>

  <footer>
    <h4>Sources</h4>
    <ol class="sources">
      <li id="source-1">
        <a href="https://statistics.tokyo.jp">
          Tokyo Metropolitan Government Statistics Bureau, 2024
        </a>
      </li>
      <li id="source-2">
        <a href="https://example.com/tokyo-history">
          Encyclopedia of Japanese History
        </a>
      </li>
    </ol>
  </footer>
</div>
```

```tsx
// Component for inline citations
interface Citation {
  id: string;
  url: string;
  title: string;
  date?: string;
}

function CitedText({
  children,
  citations
}: {
  children: React.ReactNode;
  citations: Citation[];
}) {
  return (
    <article>
      <div className="content">{children}</div>

      {citations.length > 0 && (
        <footer aria-label="Sources">
          <h4>Sources</h4>
          <ol className="citation-list">
            {citations.map((citation) => (
              <li key={citation.id} id={`citation-${citation.id}`}>
                <a href={citation.url}>
                  {citation.title}
                  {citation.date && <time> ({citation.date})</time>}
                </a>
              </li>
            ))}
          </ol>
        </footer>
      )}
    </article>
  );
}

// Usage with citation markers
function ResponseWithCitations() {
  return (
    <CitedText citations={sources}>
      <p>
        Climate change has accelerated significantly
        <a href="#citation-1" aria-label="Citation 1"><sup>[1]</sup></a>,
        with global temperatures rising 1.1 degrees Celsius since 1880
        <a href="#citation-2" aria-label="Citation 2"><sup>[2]</sup></a>.
      </p>
    </CitedText>
  );
}
```

---

## Rule 4: Show Confidence Indicators

### Incorrect - No Confidence Indication

```html
<!-- User cannot assess reliability -->
<div class="ai-response">
  <p>You should invest in Company XYZ stock.</p>
</div>
```

### Correct - Clear Confidence Communication

```html
<div class="ai-response">
  <p>Based on available information, Company XYZ appears to have
     strong growth potential.</p>

  <div class="confidence-indicator" role="meter"
       aria-valuenow="65" aria-valuemin="0" aria-valuemax="100"
       aria-label="Confidence level: 65% - Moderate">
    <span class="visually-hidden">Moderate confidence (65%)</span>
    <div class="meter" style="width: 65%" aria-hidden="true"></div>
  </div>

  <p class="disclaimer">
    <strong>Note:</strong> This analysis is based on limited data and
    should not be considered financial advice. Please consult a
    qualified financial advisor.
  </p>
</div>
```

```tsx
// Confidence badge component
type ConfidenceLevel = 'high' | 'medium' | 'low' | 'uncertain';

function ConfidenceBadge({ level, percentage }: {
  level: ConfidenceLevel;
  percentage: number;
}) {
  const descriptions = {
    high: 'High confidence - Based on strong evidence',
    medium: 'Moderate confidence - Some uncertainty exists',
    low: 'Low confidence - Limited information available',
    uncertain: 'Uncertain - Unable to verify',
  };

  return (
    <div
      className={`confidence-badge confidence-${level}`}
      role="status"
      aria-label={descriptions[level]}
    >
      <span className="badge-icon" aria-hidden="true">
        {level === 'high' && '✓'}
        {level === 'medium' && '○'}
        {level === 'low' && '△'}
        {level === 'uncertain' && '?'}
      </span>
      <span className="badge-text">
        {percentage}% confidence
      </span>
      <details>
        <summary>What does this mean?</summary>
        <p>{descriptions[level]}</p>
      </details>
    </div>
  );
}
```

---

## Rule 5: Distinguish AI Content from Human Content

### Incorrect - Ambiguous Content Source

```html
<!-- Unclear what is AI-generated -->
<div class="chat">
  <div class="message">How do I reset my password?</div>
  <div class="message">Click Settings, then Security, then Reset Password.</div>
</div>
```

### Correct - Clear AI Attribution

```html
<div class="chat" role="log" aria-label="Conversation with AI assistant">
  <article class="message user" aria-label="You said">
    <header>
      <span class="author">You</span>
      <time datetime="2024-01-15T10:30">10:30 AM</time>
    </header>
    <p>How do I reset my password?</p>
  </article>

  <article class="message ai" aria-label="AI assistant response">
    <header>
      <span class="author">
        <span class="ai-indicator" aria-hidden="true">🤖</span>
        AI Assistant
      </span>
      <time datetime="2024-01-15T10:30">10:30 AM</time>
    </header>
    <p>Click Settings, then Security, then Reset Password.</p>
    <footer class="ai-disclaimer">
      <small>This response was generated by AI.
        <a href="/help/ai-responses">Learn more</a>
      </small>
    </footer>
  </article>
</div>
```

```tsx
// Message component with clear attribution
interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

function ChatMessage({ message }: { message: Message }) {
  const isAI = message.sender === 'ai';

  return (
    <article
      className={`message ${message.sender}`}
      aria-label={isAI ? 'AI assistant response' : 'Your message'}
    >
      <header>
        <span className="author">
          {isAI ? (
            <>
              <span className="ai-badge" aria-label="AI generated">AI</span>
              Assistant
            </>
          ) : (
            'You'
          )}
        </span>
        <time dateTime={message.timestamp.toISOString()}>
          {formatTime(message.timestamp)}
        </time>
      </header>

      <div className="content">{message.content}</div>

      {isAI && (
        <footer className="ai-footer">
          <small>AI-generated response</small>
        </footer>
      )}
    </article>
  );
}
```

---

## Testing Guidance

### Manual Testing
1. Verify processing states are visible and announced
2. Check that sources are linked and accessible
3. Confirm AI vs human content is clearly distinguished
4. Test that confidence indicators are perceivable

### Screen Reader Testing
- Processing status announced via live regions
- Source citations navigable and meaningful
- AI attribution clearly announced
- Confidence levels communicated accessibly

### Automated Testing

```javascript
// Test processing state announcement
test('processing state is announced', async () => {
  render(<ChatInterface />);

  await userEvent.type(screen.getByRole('textbox'), 'Hello');
  await userEvent.click(screen.getByRole('button', { name: /send/i }));

  expect(screen.getByRole('status')).toHaveTextContent(/analyzing/i);
});

// Test source citations
test('AI responses include sources', async () => {
  render(<AIResponse {...responseWithSources} />);

  expect(screen.getByRole('heading', { name: /sources/i })).toBeInTheDocument();
  expect(screen.getAllByRole('link')).toHaveLength(2);
});

// Test AI attribution
test('AI messages are clearly labeled', () => {
  render(<ChatMessage message={aiMessage} />);

  expect(screen.getByLabelText(/ai assistant response/i)).toBeInTheDocument();
  expect(screen.getByText(/ai-generated/i)).toBeInTheDocument();
});

// Test confidence indicators
test('confidence level is accessible', () => {
  render(<ConfidenceBadge level="medium" percentage={65} />);

  expect(screen.getByRole('status')).toHaveAccessibleName(/moderate confidence/i);
});
```

---

## Modern AI UX Best Practices

| Principle | Implementation |
|-----------|----------------|
| Show thinking | Display processing steps and progress |
| Cite sources | Link to original information sources |
| Express uncertainty | Use confidence indicators for ambiguous responses |
| Label AI content | Clearly distinguish AI from human content |
| Explain reasoning | Offer expandable explanations for decisions |
| Enable verification | Provide ways to check AI-generated information |
| Set expectations | Communicate AI limitations upfront |

---

## Quick Reference

| Element | Accessibility Approach |
|---------|----------------------|
| Processing indicator | `role="status"`, `aria-live="polite"` |
| Source list | Semantic list with links |
| Confidence meter | `role="meter"` with labels |
| AI badge | Visual + text label |
| Reasoning section | `<details>` expandable |
