# Mermaid Diagrams in Obsidian

Obsidian renders Mermaid natively in fenced code blocks. The syntax is:
````markdown
```mermaid
[diagram type]
    [content]
```
````

---

## Flow & Process Diagrams

### Flowchart
````markdown
```mermaid
flowchart TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E
```
````

**Directions**: `TD` (top-down), `LR` (left-right), `BT` (bottom-top), `RL` (right-left)

**Node Shapes**:
```
[Square]       (Round)        {Diamond}
[[Subroutine]] [(Cylinder)]   ((Circle))
>Asymmetric]   {{{Hexagon}}}  [/Parallelogram/]
[\Trapezoid\]
```

### Sequence Diagram
````markdown
```mermaid
sequenceDiagram
    participant U as User
    participant S as Server
    participant DB as Database

    U->>S: Login Request
    activate S
    S->>DB: Verify Credentials
    DB-->>S: User Found
    S-->>U: Auth Token
    deactivate S

    Note over U,S: User is now authenticated

    loop Every 5 minutes
        U->>S: Heartbeat
    end

    alt Success
        S-->>U: 200 OK
    else Failure
        S-->>U: 401 Unauthorized
    end
```
````

**Arrow Types**: `->>` (solid), `-->>` (dotted), `-x` (cross), `-)` (async)

### State Diagram
````markdown
```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Processing: Start
    Processing --> Success: Complete
    Processing --> Error: Fail
    Success --> [*]
    Error --> Idle: Retry

    state Processing {
        [*] --> Validating
        Validating --> Executing
        Executing --> [*]
    }
```
````

### User Journey
````markdown
```mermaid
journey
    title User Onboarding Journey
    section Discovery
      Find website: 3: User
      Read landing page: 4: User
    section Signup
      Create account: 5: User
      Verify email: 2: User, System
    section First Use
      Complete tutorial: 4: User
      Create first item: 5: User
```
````

---

## Data & Metrics Diagrams

### Pie Chart
````markdown
```mermaid
pie showData
    title Time Distribution
    "Development" : 45
    "Meetings" : 20
    "Documentation" : 15
    "Research" : 20
```
````

### XY Chart
````markdown
```mermaid
xychart-beta
    title "Monthly Revenue"
    x-axis [Jan, Feb, Mar, Apr, May, Jun]
    y-axis "Revenue (K)" 0 --> 100
    bar [30, 45, 60, 55, 70, 85]
    line [30, 45, 60, 55, 70, 85]
```
````

### Quadrant Chart
````markdown
```mermaid
quadrantChart
    title Priority Matrix
    x-axis Low Effort --> High Effort
    y-axis Low Impact --> High Impact
    quadrant-1 Do First
    quadrant-2 Schedule
    quadrant-3 Delegate
    quadrant-4 Eliminate
    Task A: [0.8, 0.9]
    Task B: [0.3, 0.7]
    Task C: [0.6, 0.2]
```
````

### Sankey Diagram
````markdown
```mermaid
sankey-beta
%%{init: {"sankey": {"showValues": true}}}%%

Revenue,Costs,400
Revenue,Profit,600
Costs,Salaries,250
Costs,Operations,150
```
````

---

## Architecture & Design Diagrams

### Class Diagram
````markdown
```mermaid
classDiagram
    class Animal {
        +String name
        +int age
        +makeSound() void
    }
    class Dog {
        +String breed
        +bark() void
    }
    class Cat {
        +bool indoor
        +meow() void
    }
    Animal <|-- Dog
    Animal <|-- Cat
    Dog "1" --> "*" Toy : plays with
```
````

**Relationships**: `<|--` (inheritance), `*--` (composition), `o--` (aggregation), `-->` (association), `..>` (dependency)

### Entity-Relationship Diagram
````markdown
```mermaid
erDiagram
    USER ||--o{ ORDER : places
    USER {
        int id PK
        string name
        string email UK
    }
    ORDER ||--|{ LINE_ITEM : contains
    ORDER {
        int id PK
        date created
        int user_id FK
    }
    PRODUCT ||--o{ LINE_ITEM : "appears in"
    PRODUCT {
        int id PK
        string name
        float price
    }
```
````

**Cardinality**: `||` (exactly one), `o|` (zero or one), `}|` (one or more), `}o` (zero or more)

### C4 Context Diagram
````markdown
```mermaid
C4Context
    title System Context Diagram

    Person(user, "User", "A user of the system")
    System(system, "Main System", "The primary application")
    System_Ext(email, "Email System", "External email provider")

    Rel(user, system, "Uses", "HTTPS")
    Rel(system, email, "Sends emails", "SMTP")
```
````

### Block Diagram
````markdown
```mermaid
block-beta
    columns 3

    Frontend:3
    block:backend:2
        API
        DB[(Database)]
    end
    Cache

    Frontend --> API
    API --> DB
    API --> Cache
```
````

---

## Planning & Organization Diagrams

### Gantt Chart
````markdown
```mermaid
gantt
    title Project Timeline
    dateFormat YYYY-MM-DD
    excludes weekends

    section Planning
    Requirements    :a1, 2026-01-01, 7d
    Design          :a2, after a1, 5d

    section Development
    Backend         :b1, after a2, 14d
    Frontend        :b2, after a2, 14d
    Integration     :b3, after b1, 7d

    section Testing
    QA Testing      :c1, after b3, 7d
    UAT             :milestone, after c1, 0d
```
````

### Timeline
````markdown
```mermaid
timeline
    title Company History
    section Foundation
        2020 : Company founded
             : First product launched
    section Growth
        2021 : Series A funding
             : Team expansion to 50
        2022 : International expansion
    section Scale
        2023 : IPO
        2024 : 1M customers
```
````

### Mindmap
````markdown
```mermaid
mindmap
    root((Project))
        Goals
            Increase revenue
            Improve UX
        Risks
            Technical debt
            Competition
        Resources
            Team
                Developers
                Designers
            Budget
```
````

### Git Graph
````markdown
```mermaid
gitGraph
    commit id: "Initial"
    branch develop
    checkout develop
    commit id: "Feature A"
    commit id: "Feature B"
    checkout main
    merge develop id: "Release 1.0"
    commit id: "Hotfix"
    branch feature-x
    commit id: "WIP"
```
````

---

## Mermaid Styling & Theming

### Built-in Themes
```mermaid
%%{init: {'theme': 'dark'}}%%
```
Available: `default`, `dark`, `forest`, `neutral`, `base`

### Custom Styling with classDef
````markdown
```mermaid
flowchart LR
    A[Start]:::green --> B[Process]:::blue --> C[End]:::green

    classDef green fill:#9f6,stroke:#333,stroke-width:2px
    classDef blue fill:#69f,stroke:#333,stroke-width:2px
```
````

### Inline Styling
````markdown
```mermaid
flowchart LR
    A[Start]:::important --> B

    style A fill:#f96,color:#fff
    class A important
```
````

---

## Diagram Selection Guide

| Diagram | Best For |
|---------|----------|
| **Flowchart** | Decisions, processes, workflows, algorithms |
| **Sequence** | API calls, interactions, protocols |
| **State** | Lifecycles, status transitions |
| **User Journey** | UX flows, customer experience |
| **Pie** | Proportions, distributions |
| **XY Chart** | Trends, comparisons over time |
| **Quadrant** | Priority matrices, 2x2 analysis |
| **Sankey** | Flow quantities, resource distribution |
| **Class** | Object-oriented design, data models |
| **ER** | Database schemas, relationships |
| **C4** | System architecture, contexts |
| **Block** | Component layouts, infrastructure |
| **Gantt** | Project schedules, timelines |
| **Timeline** | History, milestones, events |
| **Mindmap** | Brainstorming, topic exploration |
| **Git** | Branch strategies, version history |
