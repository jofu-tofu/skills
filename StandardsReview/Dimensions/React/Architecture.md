# Architecture — React

> Component architecture determines how well a codebase scales in complexity, team size, and feature velocity — get the composition model right and everything else becomes easier.

## Mental Model

React's component model is fundamentally about composition. The 8 rules in this dimension exist because the most common source of accidental complexity in React codebases is not performance or rendering — it is poor component design that compounds over time. Boolean props create exponential conditional branches. Monolithic components resist reuse. Tight coupling between state shape and consumer code makes refactors dangerous. These are architectural debts that slow every future change.

The underlying design principle is the Open-Closed Principle adapted for components: a component should be open for composition but closed for modification. Compound components let consumers assemble exactly what they need without touching internal logic. Explicit variants replace hidden boolean logic with named, self-documenting alternatives. Context interfaces decouple consumers from specific state implementations, enabling dependency injection at the React level.

React 19 further reinforces this direction by removing the need for `forwardRef` (refs are now regular props) and by making `use()` the canonical way to consume context. These API changes are not cosmetic — they reduce the ceremony around composition patterns, which means there is less excuse for shortcuts like prop drilling or boolean flag accumulation.

When these 8 rules are applied together, they produce components that are independently testable, composable without coordination, and resistant to the kind of cascading changes that plague monolithic component trees. The key insight is that architecture rules are force multipliers: a well-composed component tree makes performance optimization, server component adoption, and bundle splitting dramatically easier because the boundaries are already clean.

## Consumer Guide

### When Reviewing Code

Scan for these violations in severity order:

1. **Boolean prop accumulation** — Any component with 3+ boolean props is a strong signal. Look for `isX`, `showY`, `hasZ` patterns in prop interfaces. This is the single most common architecture violation and the hardest to unwind later.
2. **Render prop sprawl** — Components accepting `renderHeader`, `renderFooter`, `renderActions` callbacks instead of using children composition. These create implicit contracts that are hard to type and impossible to compose.
3. **Direct state coupling** — Components that import specific store shapes, specific context values, or specific hook return types rather than accepting data through props or a generic context interface.
4. **Missing compound component pattern** — Complex UI (modals, forms, toolbars, composers) implemented as a single component with 10+ props instead of a provider + composable subcomponents.
5. **forwardRef in React 19** — Any use of `React.forwardRef` in a React 19+ codebase. Refs are regular props now; forwardRef adds unnecessary wrapper complexity.

### When Designing / Planning

Before writing a new component, ask:

- **Will this component need variants?** If yes, design explicit named variants (e.g., `ThreadComposer`, `ChannelComposer`) rather than a single component with boolean switches.
- **Will consumers need to customize the layout?** If yes, use compound components with a shared context provider. If no, a simple props interface is sufficient.
- **Does this component need to work with different state sources?** If yes, define a context interface (generic provider pattern) so the component is decoupled from any specific state management library.
- **Is there a ref forwarding need?** In React 19+, just accept `ref` as a prop. In older versions, use `forwardRef` but plan to remove it during migration.

The decision tree: simple display component (just props) -> configurable component (explicit variants) -> complex interactive component (compound components with context).

### When Implementing

Apply rules in this order:

1. **Start with the interface** — Define the props/context shape before writing JSX. Use `StateContextInterface` to ensure the interface is generic enough for dependency injection.
2. **Choose composition strategy** — `PatternsChildrenOverRenderProps` for simple slot-based composition; `ArchitectureCompoundComponents` for complex multi-part UI.
3. **Eliminate boolean props** — For each boolean prop, ask: "Could this be a named variant or a composed subcomponent instead?" Apply `ArchitectureAvoidBooleanProps` and `PatternsExplicitVariants`.
4. **Lift state to the right level** — Use `StateLiftState` to find the lowest common ancestor. Use `StateDecoupleImplementation` to keep implementation details out of the interface.
5. **Modernize API surface** — Apply `React19NoForwardref` if on React 19+.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| ArchitectureAvoidBooleanProps | HIGH | Replace boolean prop flags with explicit named variants or composed subcomponents |
| ArchitectureCompoundComponents | HIGH | Structure complex UI as provider + composable subcomponents with shared context |
| StateDecoupleImplementation | MEDIUM | Keep state implementation details behind stable interfaces |
| StateContextInterface | HIGH | Define generic context interfaces for dependency injection across component trees |
| StateLiftState | MEDIUM | Move shared state to the lowest common ancestor to avoid prop drilling |
| PatternsExplicitVariants | HIGH | Use named variant components instead of conditional logic inside a single component |
| PatternsChildrenOverRenderProps | MEDIUM | Prefer children composition over render prop callbacks for layout customization |
| React19NoForwardref | MEDIUM | Remove forwardRef wrappers in React 19+ where ref is a regular prop |


---

---
title: Avoid Boolean Prop Proliferation
impact: CRITICAL
impactDescription: prevents unmaintainable component variants
tags: composition, props, architecture
---

### R1.1 Avoid Boolean Prop Proliferation

Don't add boolean props like `isThread`, `isEditing`, `isDMThread` to customize
component behavior. Each boolean doubles possible states and creates
unmaintainable conditional logic. Use composition instead.

**Incorrect (boolean props create exponential complexity):**

```tsx
function Composer({
  onSubmit,
  isThread,
  channelId,
  isDMThread,
  dmId,
  isEditing,
  isForwarding,
}: Props) {
  return (
    <form>
      <Header />
      <Input />
      {isDMThread ? (
        <AlsoSendToDMField id={dmId} />
      ) : isThread ? (
        <AlsoSendToChannelField id={channelId} />
      ) : null}
      {isEditing ? (
        <EditActions />
      ) : isForwarding ? (
        <ForwardActions />
      ) : (
        <DefaultActions />
      )}
      <Footer onSubmit={onSubmit} />
    </form>
  )
}
```

**Correct (composition eliminates conditionals):**

```tsx
// Channel composer
function ChannelComposer() {
  return (
    <Composer.Frame>
      <Composer.Header />
      <Composer.Input />
      <Composer.Footer>
        <Composer.Attachments />
        <Composer.Formatting />
        <Composer.Emojis />
        <Composer.Submit />
      </Composer.Footer>
    </Composer.Frame>
  )
}

// Thread composer - adds "also send to channel" field
function ThreadComposer({ channelId }: { channelId: string }) {
  return (
    <Composer.Frame>
      <Composer.Header />
      <Composer.Input />
      <AlsoSendToChannelField id={channelId} />
      <Composer.Footer>
        <Composer.Formatting />
        <Composer.Emojis />
        <Composer.Submit />
      </Composer.Footer>
    </Composer.Frame>
  )
}

// Edit composer - different footer actions
function EditComposer() {
  return (
    <Composer.Frame>
      <Composer.Input />
      <Composer.Footer>
        <Composer.Formatting />
        <Composer.Emojis />
        <Composer.CancelEdit />
        <Composer.SaveEdit />
      </Composer.Footer>
    </Composer.Frame>
  )
}
```

Each variant is explicit about what it renders. We can share internals without
sharing a single monolithic parent.

---

---
title: Use Compound Components
impact: HIGH
impactDescription: enables flexible composition without prop drilling
tags: composition, compound-components, architecture
---

### R1.2 Use Compound Components

Structure complex components as compound components with a shared context. Each
subcomponent accesses shared state via context, not props. Consumers compose the
pieces they need.

**Incorrect (monolithic component with render props):**

```tsx
function Composer({
  renderHeader,
  renderFooter,
  renderActions,
  showAttachments,
  showFormatting,
  showEmojis,
}: Props) {
  return (
    <form>
      {renderHeader?.()}
      <Input />
      {showAttachments && <Attachments />}
      {renderFooter ? (
        renderFooter()
      ) : (
        <Footer>
          {showFormatting && <Formatting />}
          {showEmojis && <Emojis />}
          {renderActions?.()}
        </Footer>
      )}
    </form>
  )
}
```

**Correct (compound components with shared context):**

```tsx
const ComposerContext = createContext<ComposerContextValue | null>(null)

function ComposerProvider({ children, state, actions, meta }: ProviderProps) {
  return (
    <ComposerContext value={{ state, actions, meta }}>
      {children}
    </ComposerContext>
  )
}

function ComposerFrame({ children }: { children: React.ReactNode }) {
  return <form>{children}</form>
}

function ComposerInput() {
  const {
    state,
    actions: { update },
    meta: { inputRef },
  } = use(ComposerContext)
  return (
    <TextInput
      ref={inputRef}
      value={state.input}
      onChangeText={(text) => update((s) => ({ ...s, input: text }))}
    />
  )
}

function ComposerSubmit() {
  const {
    actions: { submit },
  } = use(ComposerContext)
  return <Button onPress={submit}>Send</Button>
}

// Export as compound component
const Composer = {
  Provider: ComposerProvider,
  Frame: ComposerFrame,
  Input: ComposerInput,
  Submit: ComposerSubmit,
  Header: ComposerHeader,
  Footer: ComposerFooter,
  Attachments: ComposerAttachments,
  Formatting: ComposerFormatting,
  Emojis: ComposerEmojis,
}
```

**Usage:**

```tsx
<Composer.Provider state={state} actions={actions} meta={meta}>
  <Composer.Frame>
    <Composer.Header />
    <Composer.Input />
    <Composer.Footer>
      <Composer.Formatting />
      <Composer.Submit />
    </Composer.Footer>
  </Composer.Frame>
</Composer.Provider>
```

Consumers explicitly compose exactly what they need. No hidden conditionals. And the state, actions and meta are dependency-injected by a parent provider, allowing multiple usages of the same component structure.

---

---
title: Decouple State Management from UI
impact: MEDIUM
impactDescription: enables swapping state implementations without changing UI
tags: composition, state, architecture
---

### R1.3 Decouple State Management from UI

The provider component should be the only place that knows how state is managed.
UI components consume the context interface—they don't know if state comes from
useState, Zustand, or a server sync.

**Incorrect (UI coupled to state implementation):**

```tsx
function ChannelComposer({ channelId }: { channelId: string }) {
  // UI component knows about global state implementation
  const state = useGlobalChannelState(channelId)
  const { submit, updateInput } = useChannelSync(channelId)

  return (
    <Composer.Frame>
      <Composer.Input
        value={state.input}
        onChange={(text) => sync.updateInput(text)}
      />
      <Composer.Submit onPress={() => sync.submit()} />
    </Composer.Frame>
  )
}
```

**Correct (state management isolated in provider):**

```tsx
// Provider handles all state management details
function ChannelProvider({
  channelId,
  children,
}: {
  channelId: string
  children: React.ReactNode
}) {
  const { state, update, submit } = useGlobalChannel(channelId)
  const inputRef = useRef(null)

  return (
    <Composer.Provider
      state={state}
      actions={{ update, submit }}
      meta={{ inputRef }}
    >
      {children}
    </Composer.Provider>
  )
}

// UI component only knows about the context interface
function ChannelComposer() {
  return (
    <Composer.Frame>
      <Composer.Header />
      <Composer.Input />
      <Composer.Footer>
        <Composer.Submit />
      </Composer.Footer>
    </Composer.Frame>
  )
}

// Usage
function Channel({ channelId }: { channelId: string }) {
  return (
    <ChannelProvider channelId={channelId}>
      <ChannelComposer />
    </ChannelProvider>
  )
}
```

**Different providers, same UI:**

```tsx
// Local state for ephemeral forms
function ForwardMessageProvider({ children }) {
  const [state, setState] = useState(initialState)
  const forwardMessage = useForwardMessage()

  return (
    <Composer.Provider
      state={state}
      actions={{ update: setState, submit: forwardMessage }}
    >
      {children}
    </Composer.Provider>
  )
}

// Global synced state for channels
function ChannelProvider({ channelId, children }) {
  const { state, update, submit } = useGlobalChannel(channelId)

  return (
    <Composer.Provider state={state} actions={{ update, submit }}>
      {children}
    </Composer.Provider>
  )
}
```

The same `Composer.Input` component works with both providers because it only
depends on the context interface, not the implementation.

---

---
title: Define Generic Context Interfaces for Dependency Injection
impact: HIGH
impactDescription: enables dependency-injectable state across use-cases
tags: composition, context, state, typescript, dependency-injection
---

### R1.4 Define Generic Context Interfaces for Dependency Injection

Define a **generic interface** for your component context with three parts:
`state`, `actions`, and `meta`. This interface is a contract that any provider
can implement—enabling the same UI components to work with completely different
state implementations.

**Core principle:** Lift state, compose internals, make state
dependency-injectable.

**Incorrect (UI coupled to specific state implementation):**

```tsx
function ComposerInput() {
  // Tightly coupled to a specific hook
  const { input, setInput } = useChannelComposerState()
  return <TextInput value={input} onChangeText={setInput} />
}
```

**Correct (generic interface enables dependency injection):**

```tsx
// Define a GENERIC interface that any provider can implement
interface ComposerState {
  input: string
  attachments: Attachment[]
  isSubmitting: boolean
}

interface ComposerActions {
  update: (updater: (state: ComposerState) => ComposerState) => void
  submit: () => void
}

interface ComposerMeta {
  inputRef: React.RefObject<TextInput>
}

interface ComposerContextValue {
  state: ComposerState
  actions: ComposerActions
  meta: ComposerMeta
}

const ComposerContext = createContext<ComposerContextValue | null>(null)
```

**UI components consume the interface, not the implementation:**

```tsx
function ComposerInput() {
  const {
    state,
    actions: { update },
    meta,
  } = use(ComposerContext)

  // This component works with ANY provider that implements the interface
  return (
    <TextInput
      ref={meta.inputRef}
      value={state.input}
      onChangeText={(text) => update((s) => ({ ...s, input: text }))}
    />
  )
}
```

**Different providers implement the same interface:**

```tsx
// Provider A: Local state for ephemeral forms
function ForwardMessageProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState(initialState)
  const inputRef = useRef(null)
  const submit = useForwardMessage()

  return (
    <ComposerContext
      value={{
        state,
        actions: { update: setState, submit },
        meta: { inputRef },
      }}
    >
      {children}
    </ComposerContext>
  )
}

// Provider B: Global synced state for channels
function ChannelProvider({ channelId, children }: Props) {
  const { state, update, submit } = useGlobalChannel(channelId)
  const inputRef = useRef(null)

  return (
    <ComposerContext
      value={{
        state,
        actions: { update, submit },
        meta: { inputRef },
      }}
    >
      {children}
    </ComposerContext>
  )
}
```

**The same composed UI works with both:**

```tsx
// Works with ForwardMessageProvider (local state)
<ForwardMessageProvider>
  <Composer.Frame>
    <Composer.Input />
    <Composer.Submit />
  </Composer.Frame>
</ForwardMessageProvider>

// Works with ChannelProvider (global synced state)
<ChannelProvider channelId="abc">
  <Composer.Frame>
    <Composer.Input />
    <Composer.Submit />
  </Composer.Frame>
</ChannelProvider>
```

**Custom UI outside the component can access state and actions:**

The provider boundary is what matters—not the visual nesting. Components that
need shared state don't have to be inside the `Composer.Frame`. They just need
to be within the provider.

```tsx
function ForwardMessageDialog() {
  return (
    <ForwardMessageProvider>
      <Dialog>
        {/* The composer UI */}
        <Composer.Frame>
          <Composer.Input placeholder="Add a message, if you'd like." />
          <Composer.Footer>
            <Composer.Formatting />
            <Composer.Emojis />
          </Composer.Footer>
        </Composer.Frame>

        {/* Custom UI OUTSIDE the composer, but INSIDE the provider */}
        <MessagePreview />

        {/* Actions at the bottom of the dialog */}
        <DialogActions>
          <CancelButton />
          <ForwardButton />
        </DialogActions>
      </Dialog>
    </ForwardMessageProvider>
  )
}

// This button lives OUTSIDE Composer.Frame but can still submit based on its context!
function ForwardButton() {
  const {
    actions: { submit },
  } = use(ComposerContext)
  return <Button onPress={submit}>Forward</Button>
}

// This preview lives OUTSIDE Composer.Frame but can read composer's state!
function MessagePreview() {
  const { state } = use(ComposerContext)
  return <Preview message={state.input} attachments={state.attachments} />
}
```

The `ForwardButton` and `MessagePreview` are not visually inside the composer
box, but they can still access its state and actions. This is the power of
lifting state into providers.

The UI is reusable bits you compose together. The state is dependency-injected
by the provider. Swap the provider, keep the UI.

---

---
title: Lift State into Provider Components
impact: HIGH
impactDescription: enables state sharing outside component boundaries
tags: composition, state, context, providers
---

### R1.5 Lift State into Provider Components

Move state management into dedicated provider components. This allows sibling
components outside the main UI to access and modify state without prop drilling
or awkward refs.

**Incorrect (state trapped inside component):**

```tsx
function ForwardMessageComposer() {
  const [state, setState] = useState(initialState)
  const forwardMessage = useForwardMessage()

  return (
    <Composer.Frame>
      <Composer.Input />
      <Composer.Footer />
    </Composer.Frame>
  )
}

// Problem: How does this button access composer state?
function ForwardMessageDialog() {
  return (
    <Dialog>
      <ForwardMessageComposer />
      <MessagePreview /> {/* Needs composer state */}
      <DialogActions>
        <CancelButton />
        <ForwardButton /> {/* Needs to call submit */}
      </DialogActions>
    </Dialog>
  )
}
```

**Incorrect (useEffect to sync state up):**

```tsx
function ForwardMessageDialog() {
  const [input, setInput] = useState('')
  return (
    <Dialog>
      <ForwardMessageComposer onInputChange={setInput} />
      <MessagePreview input={input} />
    </Dialog>
  )
}

function ForwardMessageComposer({ onInputChange }) {
  const [state, setState] = useState(initialState)
  useEffect(() => {
    onInputChange(state.input) // Sync on every change
  }, [state.input])
}
```

**Incorrect (reading state from ref on submit):**

```tsx
function ForwardMessageDialog() {
  const stateRef = useRef(null)
  return (
    <Dialog>
      <ForwardMessageComposer stateRef={stateRef} />
      <ForwardButton onPress={() => submit(stateRef.current)} />
    </Dialog>
  )
}
```

**Correct (state lifted to provider):**

```tsx
function ForwardMessageProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState(initialState)
  const forwardMessage = useForwardMessage()
  const inputRef = useRef(null)

  return (
    <Composer.Provider
      state={state}
      actions={{ update: setState, submit: forwardMessage }}
      meta={{ inputRef }}
    >
      {children}
    </Composer.Provider>
  )
}

function ForwardMessageDialog() {
  return (
    <ForwardMessageProvider>
      <Dialog>
        <ForwardMessageComposer />
        <MessagePreview /> {/* Custom components can access state and actions */}
        <DialogActions>
          <CancelButton />
          <ForwardButton /> {/* Custom components can access state and actions */}
        </DialogActions>
      </Dialog>
    </ForwardMessageProvider>
  )
}

function ForwardButton() {
  const { actions } = use(Composer.Context)
  return <Button onPress={actions.submit}>Forward</Button>
}
```

The ForwardButton lives outside the Composer.Frame but still has access to the
submit action because it's within the provider. Even though it's a one-off
component, it can still access the composer's state and actions from outside the
UI itself.

**Key insight:** Components that need shared state don't have to be visually
nested inside each other—they just need to be within the same provider.

---

---
title: Create Explicit Component Variants
impact: MEDIUM
impactDescription: self-documenting code, no hidden conditionals
tags: composition, variants, architecture
---

### R1.6 Create Explicit Component Variants

Instead of one component with many boolean props, create explicit variant
components. Each variant composes the pieces it needs. The code documents
itself.

**Incorrect (one component, many modes):**

```tsx
// What does this component actually render?
<Composer
  isThread
  isEditing={false}
  channelId='abc'
  showAttachments
  showFormatting={false}
/>
```

**Correct (explicit variants):**

```tsx
// Immediately clear what this renders
<ThreadComposer channelId="abc" />

// Or
<EditMessageComposer messageId="xyz" />

// Or
<ForwardMessageComposer messageId="123" />
```

Each implementation is unique, explicit and self-contained. Yet they can each
use shared parts.

**Implementation:**

```tsx
function ThreadComposer({ channelId }: { channelId: string }) {
  return (
    <ThreadProvider channelId={channelId}>
      <Composer.Frame>
        <Composer.Input />
        <AlsoSendToChannelField channelId={channelId} />
        <Composer.Footer>
          <Composer.Formatting />
          <Composer.Emojis />
          <Composer.Submit />
        </Composer.Footer>
      </Composer.Frame>
    </ThreadProvider>
  )
}

function EditMessageComposer({ messageId }: { messageId: string }) {
  return (
    <EditMessageProvider messageId={messageId}>
      <Composer.Frame>
        <Composer.Input />
        <Composer.Footer>
          <Composer.Formatting />
          <Composer.Emojis />
          <Composer.CancelEdit />
          <Composer.SaveEdit />
        </Composer.Footer>
      </Composer.Frame>
    </EditMessageProvider>
  )
}

function ForwardMessageComposer({ messageId }: { messageId: string }) {
  return (
    <ForwardMessageProvider messageId={messageId}>
      <Composer.Frame>
        <Composer.Input placeholder="Add a message, if you'd like." />
        <Composer.Footer>
          <Composer.Formatting />
          <Composer.Emojis />
          <Composer.Mentions />
        </Composer.Footer>
      </Composer.Frame>
    </ForwardMessageProvider>
  )
}
```

Each variant is explicit about:

- What provider/state it uses
- What UI elements it includes
- What actions are available

No boolean prop combinations to reason about. No impossible states.

---

---
title: Prefer Composing Children Over Render Props
impact: MEDIUM
impactDescription: cleaner composition, better readability
tags: composition, children, render-props
---

### R1.7 Prefer Children Over Render Props

Use `children` for composition instead of `renderX` props. Children are more
readable, compose naturally, and don't require understanding callback
signatures.

**Incorrect (render props):**

```tsx
function Composer({
  renderHeader,
  renderFooter,
  renderActions,
}: {
  renderHeader?: () => React.ReactNode
  renderFooter?: () => React.ReactNode
  renderActions?: () => React.ReactNode
}) {
  return (
    <form>
      {renderHeader?.()}
      <Input />
      {renderFooter ? renderFooter() : <DefaultFooter />}
      {renderActions?.()}
    </form>
  )
}

// Usage is awkward and inflexible
return (
  <Composer
    renderHeader={() => <CustomHeader />}
    renderFooter={() => (
      <>
        <Formatting />
        <Emojis />
      </>
    )}
    renderActions={() => <SubmitButton />}
  />
)
```

**Correct (compound components with children):**

```tsx
function ComposerFrame({ children }: { children: React.ReactNode }) {
  return <form>{children}</form>
}

function ComposerFooter({ children }: { children: React.ReactNode }) {
  return <footer className='flex'>{children}</footer>
}

// Usage is flexible
return (
  <Composer.Frame>
    <CustomHeader />
    <Composer.Input />
    <Composer.Footer>
      <Composer.Formatting />
      <Composer.Emojis />
      <SubmitButton />
    </Composer.Footer>
  </Composer.Frame>
)
```

**When render props are appropriate:**

```tsx
// Render props work well when you need to pass data back
<List
  data={items}
  renderItem={({ item, index }) => <Item item={item} index={index} />}
/>
```

Use render props when the parent needs to provide data or state to the child.
Use children when composing static structure.

---

---
title: React 19 API Changes
impact: MEDIUM
impactDescription: cleaner component definitions and context usage
tags: react19, refs, context, hooks
---

### R1.8 React 19 API Changes

> **React 19+ only.** Skip this if you're on React 18 or earlier.

In React 19, `ref` is now a regular prop (no `forwardRef` wrapper needed), and `use()` replaces `useContext()`.

**Incorrect (forwardRef in React 19):**

```tsx
const ComposerInput = forwardRef<TextInput, Props>((props, ref) => {
  return <TextInput ref={ref} {...props} />
})
```

**Correct (ref as a regular prop):**

```tsx
function ComposerInput({ ref, ...props }: Props & { ref?: React.Ref<TextInput> }) {
  return <TextInput ref={ref} {...props} />
}
```

**Incorrect (useContext in React 19):**

```tsx
const value = useContext(MyContext)
```

**Correct (use instead of useContext):**

```tsx
const value = use(MyContext)
```

`use()` can also be called conditionally, unlike `useContext()`.


## Rule Interactions

The architecture rules form a coherent design system where each rule reinforces the others:

- **AvoidBooleanProps + ExplicitVariants** work as a pair. The first identifies the problem (boolean flags); the second provides the solution (named variants). Applying AvoidBooleanProps without ExplicitVariants leaves developers without a clear alternative.
- **CompoundComponents + ChildrenOverRenderProps** are complementary composition strategies. Compound components handle complex multi-part UI; children composition handles simpler slot-based layouts. Using render props when either pattern would work creates unnecessary complexity.
- **ContextInterface + DecoupleImplementation + LiftState** form the state management triad. LiftState determines where state lives; DecoupleImplementation keeps implementation details hidden; ContextInterface provides the generic access pattern. Applying LiftState alone without decoupling produces components tightly coupled to a specific state shape.
- **React19NoForwardref** simplifies all composition patterns by removing wrapper overhead, making compound components and context providers cleaner.

## Anti-Patterns (Severity Calibration)

### CRITICAL
- **Boolean prop explosion**: A component with 5+ boolean props where the interaction between flags creates untested state combinations. Example: `<Editor isThread isEditing showAttachments showFormatting isCompact />` — this is 2^5 = 32 possible states, most of which are never tested.
- **God component**: A single component file exceeding 500 lines with 15+ props, mixing layout, business logic, and state management. This resists all forms of reuse and optimization.

### HIGH
- **Render prop for layout**: Using `renderHeader={() => <Header />}` when `<Composer.Header>` compound pattern or simple `children` would suffice. Render props create implicit contracts that are hard to discover and type.
- **Prop drilling through 3+ levels**: Passing a prop through intermediate components that do not use it, instead of using context or composition.

### MEDIUM
- **forwardRef in React 19+**: Unnecessary wrapper that adds a level of indirection. Not a correctness issue but creates confusion about the component's API surface.
- **Inline state shape in context**: Defining context value types inline rather than as a reusable interface, making it impossible to swap state implementations.

## Examples

### Example 1: Boolean Props to Compound Components (AvoidBooleanProps + CompoundComponents + ExplicitVariants)

```tsx
// BEFORE: Boolean props create 16 untested combinations
<Composer
  isThread={true}
  isEditing={false}
  showAttachments={true}
  showFormatting={false}
  channelId="abc"
/>

// AFTER: Named variant + compound composition
<Composer.Provider state={threadState} actions={threadActions} meta={meta}>
  <Composer.Frame>
    <Composer.Input />
    <Composer.Attachments />
    <Composer.Footer>
      <Composer.Submit />
    </Composer.Footer>
  </Composer.Frame>
</Composer.Provider>
```

Each variant (thread, channel, DM) gets its own state factory. Consumers compose only the subcomponents they need. Zero boolean flags, zero untested combinations.

### Example 2: Context Interface + Decoupled State (ContextInterface + DecoupleImplementation + LiftState)

```tsx
// BEFORE: Component coupled to specific Zustand store
function ChatList() {
  const messages = useChatStore(s => s.messages)
  const sendMessage = useChatStore(s => s.sendMessage)
  return <MessageList messages={messages} onSend={sendMessage} />
}

// AFTER: Generic context interface — works with any state source
interface ChatContext {
  messages: Message[]
  sendMessage: (text: string) => void
}

const ChatCtx = createContext<ChatContext | null>(null)

// Provider can wrap Zustand, Redux, server state, or test mocks
function ZustandChatProvider({ children }: { children: ReactNode }) {
  const messages = useChatStore(s => s.messages)
  const sendMessage = useChatStore(s => s.sendMessage)
  return (
    <ChatCtx value={{ messages, sendMessage }}>
      {children}
    </ChatCtx>
  )
}

function ChatList() {
  const { messages, sendMessage } = use(ChatCtx)
  return <MessageList messages={messages} onSend={sendMessage} />
}
```

ChatList is now testable with a simple mock provider. State implementation can be swapped without touching any consumer code.

### Example 3: Children Over Render Props + React 19 Ref (ChildrenOverRenderProps + React19NoForwardref)

```tsx
// BEFORE: render props + forwardRef
const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ renderHeader, renderBody, renderFooter, ...props }, ref) => (
    <div ref={ref} {...props}>
      {renderHeader()}
      {renderBody()}
      {renderFooter?.()}
    </div>
  )
)

// AFTER: children composition + ref as prop (React 19)
function Modal({ children, ref, ...props }: ModalProps & { ref?: Ref<HTMLDivElement> }) {
  return <div ref={ref} {...props}>{children}</div>
}

// Usage — composable, discoverable, typed
<Modal ref={modalRef}>
  <Modal.Header title="Confirm" />
  <Modal.Body>{content}</Modal.Body>
  <Modal.Footer>
    <Button onClick={onCancel}>Cancel</Button>
    <Button onClick={onConfirm}>Confirm</Button>
  </Modal.Footer>
</Modal>
```

## Does Not Cover

- **Performance optimization** — See RenderingPerf (R4) for re-render, memoization, and hydration concerns.
- **Data fetching patterns** — See DataFetching (R2) for async waterfalls, Suspense boundaries, and caching.
- **Server/client boundary decisions** — See ServerComponents (R3) for RSC-specific architecture.
- **Bundle size implications of component design** — See BundleSize (R5) for import and code-splitting patterns.

## Sources

- Vercel Engineering — React Composition Patterns (January 2026), MIT
- React Documentation — Compound Components, Context API, React 19 Release Notes
