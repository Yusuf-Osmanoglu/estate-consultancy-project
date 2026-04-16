# DESIGN.md — Architecture & Design Decisions

## 1. System Overview

This project implements a **real estate transaction management system** for an estate agency consultancy. The system automates the lifecycle of property transactions (sale/rental), tracks the distribution of service fees (commissions) between the company and agents, and provides a clear financial breakdown for every transaction.

```
┌───────────────────────┐         ┌───────────────────────┐
│     Nuxt 3 Frontend   │  REST   │    NestJS Backend     │
│  (Pinia + Tailwind)   │◄──────►│  (Controllers +       │
│                       │  API    │   Services + DTOs)    │
└───────────────────────┘         └──────────┬────────────┘
                                             │
                                             │ Mongoose ODM
                                             ▼
                                  ┌───────────────────────┐
                                  │    MongoDB Atlas       │
                                  │  (Cloud Database)     │
                                  └───────────────────────┘
```

## 2. Backend Architecture

### 2.1 Module Organization

The NestJS backend follows a **modular architecture** with clear separation of concerns:

```
backend/src/
├── main.ts                          # App bootstrap, CORS, ValidationPipe
├── app.module.ts                    # Root module (MongoDB connection, module imports)
├── modules/
│   ├── agents/
│   │   ├── agents.module.ts         # Agent module definition
│   │   ├── agents.controller.ts     # REST endpoints (GET, POST)
│   │   ├── agents.service.ts        # Business logic (CRUD)
│   │   ├── dto/
│   │   │   └── create-agent.dto.ts  # Input validation (class-validator)
│   │   └── schemas/
│   │       └── agent.schema.ts      # Mongoose schema definition
│   └── transactions/
│       ├── transactions.module.ts
│       ├── transactions.controller.ts  # REST endpoints (CRUD + stage + breakdown)
│       ├── transactions.service.ts     # Core business logic
│       ├── transactions.service.spec.ts # Unit tests
│       ├── dto/
│       │   ├── create-transaction.dto.ts
│       │   └── update-stage.dto.ts
│       └── schemas/
│           └── transaction.schema.ts
```

**Why this structure?**
- Each module is self-contained with its own controller, service, DTO, and schema
- The `AgentsModule` is exported and imported by `TransactionsModule` for cross-module references
- DTOs enforce input validation at the API boundary using `class-validator` decorators
- Services contain all business logic, keeping controllers thin

### 2.2 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/agents` | Create a new agent |
| `GET` | `/agents` | List all agents |
| `GET` | `/agents/:id` | Get agent details |
| `POST` | `/transactions` | Create a new transaction (auto-calculates commission) |
| `GET` | `/transactions` | List all transactions (populated) |
| `GET` | `/transactions/stats` | Dashboard KPI statistics |
| `GET` | `/transactions/:id` | Get transaction details |
| `GET` | `/transactions/:id/breakdown` | Financial breakdown report |
| `PATCH` | `/transactions/:id/stage` | Advance transaction stage |

## 3. Data Models

### 3.1 Agent Schema

```typescript
{
  name: string       // Required
  email: string      // Required, unique
  phone?: string     // Optional
  timestamps: true   // createdAt, updatedAt auto-managed
}
```

### 3.2 Transaction Schema

```typescript
{
  propertyAddress: string                    // Required
  totalServiceFee: number                    // Required (total fee in USD)
  listingAgent: ObjectId → Agent             // Required (ref to Agent)
  sellingAgent: ObjectId → Agent             // Required (ref to Agent)
  status: enum('agreement'|'earnest_money'|  // Transaction lifecycle stage
               'title_deed'|'completed')
  companyShare: number                       // Calculated: 50% of totalServiceFee
  listingAgentShare: number                  // Calculated: 50% or 25%
  sellingAgentShare: number                  // Calculated: 0% or 25%
  commissionNote: string                     // Explanation of the split
  timestamps: true
}
```

**Why embedded breakdown?** The commission breakdown (companyShare, listingAgentShare, sellingAgentShare) is stored **embedded** within the transaction document rather than in a separate collection. Rationale:
- **Atomicity**: The breakdown is always consistent with the transaction — no risk of orphaned docs
- **Performance**: Single query retrieves all financial data — no additional joins
- **Immutability**: Once calculated at creation time, the breakdown reflects the exact split agreed upon
- **Simplicity**: Fewer collections = simpler queries, fewer failure modes

## 4. Business Logic

### 4.1 Commission Calculation (Case 4.3)

The commission split follows a strict **50/50 company-agent** policy:

1. **Agency Always Gets 50%**: `companyShare = totalServiceFee × 0.50`
2. **Agent Pool = 50%**: `agentPool = totalServiceFee × 0.50`

**Scenario 1 — Same Agent (listing = selling):**
- The agent receives 100% of the agent pool (50% of total)
- `listingAgentShare = agentPool` (full amount)
- `sellingAgentShare = 0`

**Scenario 2 — Different Agents:**
- Each agent receives 50% of the agent pool (25% of total each)
- `listingAgentShare = agentPool / 2`
- `sellingAgentShare = agentPool / 2`

### 4.2 Stage Transitions (Case 4.1)

Transactions follow a **strict, forward-only, sequential** stage progression:

```
agreement → earnest_money → title_deed → completed
```

**Invalid transitions are prevented:**
- Skipping stages (e.g., `agreement → completed`) → `BadRequestException`
- Backward transitions (e.g., `completed → agreement`) → `BadRequestException`
- Same-stage transitions (e.g., `agreement → agreement`) → `BadRequestException`

**Why prevent invalid transitions?** In a real estate workflow, each stage represents a legal/financial milestone that depends on the previous one. Skipping or reversing stages would create inconsistencies in the paper trail and financial records. The system enforces this at the service layer, not just the UI, ensuring data integrity regardless of the client.

### 4.3 Financial Breakdown Report (Case 4.2)

The `GET /transactions/:id/breakdown` endpoint returns a structured report:
- **Agency**: amount, percentage (always 50%), and an explanatory note
- **Listing Agent**: name, amount, percentage, and their role description
- **Selling Agent**: name, amount, percentage, and their role description
- **Commission Note**: Human-readable explanation of why the split occurred

## 5. Frontend Architecture

### 5.1 Technology Stack
- **Nuxt 3** — Vue 3 framework with file-based routing and SSR capabilities
- **Pinia** — State management (as required by the case)
- **Tailwind CSS** — Utility-first CSS framework (as recommended by the case)
- **Lucide Vue Next** — Icon library

### 5.2 Page Structure

```
frontend/
├── pages/
│   ├── index.vue                    # Dashboard (KPI cards + transaction table)
│   ├── agents.vue                   # Agent list + create agent
│   └── transactions/
│       ├── index.vue                # Full transaction list
│       └── [id].vue                 # Transaction detail (stage stepper + breakdown)
├── components/
│   ├── KpiCard.vue                  # Reusable KPI display card
│   ├── TransactionTable.vue         # Transaction data table
│   ├── StageTransition.vue          # Visual stage stepper with advance button
│   ├── CreateTransactionModal.vue   # Transaction creation form modal
│   └── CreateAgentModal.vue         # Agent creation form modal
├── stores/
│   ├── transactions.ts              # Transaction state (Pinia)
│   └── agents.ts                    # Agent state (Pinia)
├── composables/
│   └── useApi.ts                    # API fetch wrapper
└── layouts/
    └── default.vue                  # App shell (sidebar + header)
```

### 5.3 State Management (Pinia)

Two Pinia stores manage application state:

**`useTransactionsStore`:**
- `transactions[]` — Full list
- `currentTransaction` — Detail view data
- `currentBreakdown` — Financial breakdown for detail view
- `stats` — Dashboard KPI aggregates
- Actions: `fetchTransactions`, `fetchStats`, `createTransaction`, `updateStage`, `fetchBreakdown`
- Getters: `completedTransactions`, `pendingTransactions`, `formattedTotalRevenue`, `formattedCompanyProfit`

**`useAgentsStore`:**
- `agents[]` — Full list
- Actions: `fetchAgents`, `createAgent`, `fetchAgent`
- Getters: `agentCount`, `agentOptions` (for form dropdowns)

**Why Pinia over composables?** While Vue composables with `useFetch` could handle data, Pinia was chosen because:
- It's an explicit requirement of the case
- It provides centralized state that's shared across pages without re-fetching
- The store pattern separates data logic from UI concerns
- DevTools integration for debugging state changes

### 5.4 Key UI Features

1. **Dashboard KPI Cards** — Dynamic values calculated from real API data
2. **Transaction Table** — Status badges, agent avatars, commission info tooltips
3. **Stage Transition Stepper** — Visual progress indicator with "Advance" button
4. **Commission Preview** — Real-time calculation preview when creating transactions
5. **Financial Breakdown Cards** — Detailed per-stakeholder view on transaction detail page

## 6. Testing Strategy

Unit tests are implemented using **Jest** with `@nestjs/testing`:

| Test Suite | Tests | Coverage |
|-----------|-------|----------|
| Commission Calculation (Scenario 1 & 2) | 7 | companyShare, agentShares, edge cases |
| Stage Transitions (valid & invalid) | 7 | forward-only enforcement, error handling |
| Financial Breakdown | 2 | different agents, same agent scenarios |
| Stats / KPI | 1 | aggregate calculation |
| Agent CRUD | 4 | create, findAll, findOne, not found |
| **Total** | **28** | Core business logic fully covered |

## 7. Error Handling

- **NotFoundException**: Invalid IDs or missing resources
- **BadRequestException**: Invalid stage transitions, validation failures
- **ValidationPipe** (global): Rejects any request body that doesn't match the DTO
- **whitelist + forbidNonWhitelisted**: Extra fields in request bodies are rejected
