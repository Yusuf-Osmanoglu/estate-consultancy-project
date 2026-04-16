# Backend — NestJS API

Estate Consultancy Transaction Management API built with NestJS + MongoDB Atlas.

## Setup

```bash
pnpm install
cp .env.example .env  # Then fill in your MongoDB Atlas URI
```

## Environment Variables

Create a `.env` file:

```env
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/estate_db?retryWrites=true&w=majority
PORT=3001
```

## Running

```bash
pnpm run start:dev     # Development (watch mode)
pnpm run start:prod    # Production
```

## Tests

```bash
pnpm run test          # Unit tests (28 tests)
pnpm run test:cov      # Coverage report
```

## API Reference

See [DESIGN.md](../DESIGN.md) for full API documentation.
