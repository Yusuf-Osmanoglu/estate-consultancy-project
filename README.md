# 🏠 Estate Consultancy — Transaction Management System

A full-stack application for managing real estate transaction lifecycles, automating commission distribution, and providing financial transparency for estate agency consultancies.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | NestJS (Node.js + TypeScript) |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Frontend** | Nuxt 3 (Vue 3) |
| **State Management** | Pinia |
| **Styling** | Tailwind CSS |
| **Testing** | Jest |

## Features

- ✅ **Transaction Lifecycle Tracking** — `agreement → earnest_money → title_deed → completed`
- ✅ **Automatic Commission Distribution** — 50% agency, 50% agents (with scenario-based splits)
- ✅ **Financial Breakdown Reports** — Per-transaction, per-stakeholder earnings with explanations
- ✅ **Stage Transition Validation** — Forward-only, sequential stage advancement
- ✅ **Dashboard with KPIs** — Real-time revenue, profit, and deal statistics
- ✅ **Agent Management** — CRUD operations for estate agents
- ✅ **28 Unit Tests** — Commission rules, stage transitions, and business logic

## Project Structure

```
estate-consultancy-project/
├── backend/          # NestJS API server
├── frontend/         # Nuxt 3 client application
├── DESIGN.md         # Architecture & design decisions
└── README.md         # This file
```

## Prerequisites

- **Node.js** v18+ (LTS)
- **pnpm** (or npm/yarn)
- **MongoDB Atlas** account (connection string)

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Yusuf-Osmanoglu/estate-consultancy-project.git
cd estate-consultancy-project
```

### 2. Backend Setup

```bash
cd backend
pnpm install
```

Create a `.env` file in the `backend/` directory:

```env
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/estate_db?retryWrites=true&w=majority

# Server Port (default: 3001)
PORT=3001
```

### 3. Frontend Setup

```bash
cd frontend
pnpm install
```

The frontend connects to the backend via `runtimeConfig` in `nuxt.config.ts`. Default: `http://localhost:3001`.

## Running the Application

### Start Backend (Development)

```bash
cd backend
pnpm run start:dev
```

The API server will start on `http://localhost:3001`.

### Start Frontend (Development)

```bash
cd frontend
pnpm run dev
```

The Nuxt app will start on `http://localhost:3000`.

### Running Tests

```bash
cd backend
pnpm run test           # Run all unit tests
pnpm run test:cov       # Run with coverage report
pnpm run test:watch     # Watch mode
```

**Test Results:** 28 tests across 3 suites — all passing.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/agents` | Create a new agent |
| `GET` | `/agents` | List all agents |
| `GET` | `/agents/:id` | Get agent by ID |
| `POST` | `/transactions` | Create transaction (auto-calculates commission) |
| `GET` | `/transactions` | List all transactions |
| `GET` | `/transactions/stats` | Dashboard KPI stats |
| `GET` | `/transactions/:id` | Get transaction details |
| `GET` | `/transactions/:id/breakdown` | Financial breakdown report |
| `PATCH` | `/transactions/:id/stage` | Advance transaction stage |

## Commission Rules

- **Agency** always receives **50%** of the total service fee
- **Agents** share the remaining **50%**:
  - **Same agent** (listing = selling): Gets 100% of agent share (50% of total)
  - **Different agents**: Each gets 50% of agent share (25% of total each)

## Live URLs

- **Backend API**: _To be deployed_
- **Frontend**: _To be deployed_

## Author

Yusuf Osmanoğlu
