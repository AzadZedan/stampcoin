# Contributing to Stampcoin Platform 🏷️

Thank you for your interest in contributing to Stampcoin — the world's first digital philatelic trading platform!

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 10+
- Git

### Setup

```bash
git clone https://github.com/AzadZedan/stampcoin.git
cd stampcoin
pnpm install
pnpm test
pnpm dev
```

## Development Workflow

1. **Fork** the repository
2. Create a **feature branch** (`git checkout -b feature/my-feature`)
3. Write your code and **tests**
4. Ensure all tests pass: `pnpm test`
5. **Commit** your changes with a clear message
6. **Push** to your fork and open a **Pull Request**

## Code Standards

- **TypeScript** for server and client code
- **JavaScript (ESM)** for standalone modules (`blockchain.js`, `wallet.js`, `market.js`, `server.js`)
- **Indentation**: 2 spaces (no tabs)
- **Strings**: Double quotes in JS files
- **Error handling**: Wrap route handlers in `try/catch`
- Do **not** commit secrets or API tokens — use `process.env` for all sensitive values

## Testing

```bash
# Run all tests (Vitest)
pnpm test

# Run a specific test file
pnpm vitest run tests/wallet.test.js
```

Tests in `tests/` cover the standalone JS modules (`blockchain.js`, `wallet.js`, `market.js`) using Vitest with a mocked filesystem so no disk I/O occurs during tests.

## Adding New API Endpoints

1. For the **standalone REST API** (`server.js`): add your route handler following the existing REST pattern
2. For the **tRPC API** (`server/routers.ts`): add a new procedure to the appropriate router
3. All REST API routes must be prefixed with `/api/`
4. Document new endpoints in the appropriate `*_API.md` file
5. Add unit tests

## Reporting Bugs

Open an issue using the Bug Report template.

## Requesting Features

Open an issue using the Feature Request template.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
