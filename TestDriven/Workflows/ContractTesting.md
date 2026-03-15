# ContractTesting Workflow

**Trigger phrases:** "contract test", "test microservices", "consumer-driven", "pact", "test services without running them", "test API integration", "test without spinning everything up"

**Use when:** Testing that distributed services (microservices, APIs) can communicate correctly without requiring all services to run simultaneously.

## Reference Material

- **Contract Testing:** `../Rules/ContractTesting.md`
- **Test Pyramid:** `../Rules/TestPyramid.md`
- **Test Double Taxonomy:** `../Rules/TestDoubleTaxonomy.md`

---

## The Core Problem

Integration tests for microservices have a dilemma:
- **Full integration tests:** Require every service running → slow, fragile, expensive CI
- **Unit tests with mocks:** Fast but mocks drift from reality → false confidence
- **Contract tests:** Middle path — verify agreements between services without running everything

See: `Rules/ContractTesting.md` for the full principle.

---

## Decision Tree

```
What are you testing?
│
├─ "Does my service call this API correctly?"
│   → Consumer-driven contract test (you own the consumer)
│   → See: Consumer Workflow below
│
├─ "Does my service honor its API contract?"
│   → Provider verification test (you own the provider)
│   → See: Provider Workflow below
│
├─ "Do two services I own work together?"
│   → Bidirectional contract test
│   → See: Bidirectional Workflow below
│
└─ "We don't have contracts at all yet"
    → Start with a schema registry or OpenAPI spec
    → Document the API, then add contract tests
```

---

## Consumer Workflow (You call someone else's service)

**Goal:** Prove your code makes calls that the provider will accept.

```pseudocode
// Step 1: Define what you expect from the provider
contract = define_contract(
    provider: "UserService",
    consumer: "OrderService"
)

// Step 2: Describe the interaction
contract.add_interaction(
    given: "user 123 exists",
    upon_receiving: "GET /users/123",
    will_respond_with: {
        status: 200,
        body: { id: 123, name: "alice", active: true }
    }
)

// Step 3: Test against the mock provider (not the real one)
mock_server = contract.create_mock_server()

async function test_get_user():
    client = UserClient(base_url: mock_server.url)
    user = await client.get_user(123)
    assert user.name == "alice"

// Step 4: Publish the contract for the provider to verify
contract.publish_to_broker()
```

The mock server validates your requests match the contract. The published contract tells the provider what to verify.

---

## Provider Workflow (Others call your service)

**Goal:** Prove your service honors all contracts consumers expect.

```pseudocode
// Run against real running service (or test instance)
// Provider reads contracts from broker and replays them

provider_verifier = create_verifier(
    provider: "UserService",
    provider_base_url: "http://localhost:3000",
    broker_url: "https://your-pact-broker.com"
)

// State setup: create test data matching "given" states
provider_verifier.add_state_handler(
    "user 123 exists",
    setup: () => database.insert_user(id: 123, name: "alice")
)

// Run: verifier replays consumer interactions, checks responses
results = await provider_verifier.verify()
assert results.all_passed
```

---

## Bidirectional Workflow

When you own both services, both sides generate contracts independently and a broker checks compatibility — no live service needed.

---

## What Contract Tests Don't Replace

| Scenario | Use Instead |
|----------|-------------|
| Testing business logic | Unit tests |
| Testing full user flows | E2E tests (sparingly) |
| Load/performance testing | Load tests |
| Testing the provider's internal behavior | Provider's own unit tests |

Contract tests verify the **interface agreement** only — not behavior inside each service.

---

## Tools by Language

| Language | Tool |
|----------|------|
| JavaScript/TypeScript | Pact JS |
| Java | Pact JVM |
| Python | Pact Python |
| Go | Pact Go |
| .NET | PactNet |
| Language-agnostic | Spring Cloud Contract, WireMock |

---

## Related

- `Rules/ContractTesting.md` — Contract Testing principle
- `Rules/TestPyramid.md` — Where contract tests fit in the pyramid
- `Rules/TestDoubleTaxonomy.md` — What kind of double is a mock provider?
