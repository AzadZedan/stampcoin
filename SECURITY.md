# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | ✅ Fully supported |

## Reporting a Vulnerability

If you discover a security vulnerability in the Stampcoin Platform, please report it **privately** rather than opening a public issue.

### How to Report

1. **Email**: Open a private security advisory at [GitHub Security Advisories](https://github.com/AzadZedan/stampcoin/security/advisories/new)
2. **Include** in your report:
   - A description of the vulnerability
   - Steps to reproduce the issue
   - The potential impact
   - Any suggested fix (optional)

### Response Timeline

- **Acknowledgement**: within 48 hours
- **Initial assessment**: within 7 days
- **Fix and disclosure**: within 30 days (depending on complexity)

## Security Best Practices

When running the Stampcoin Platform in production:

### Environment Variables

```
NODE_ENV=production
SYNC_TOKEN=<strong-random-secret>
PORT=10000
```

- **Always** set `SYNC_TOKEN` to a strong random secret in production
- **Never** commit secrets or tokens to the repository
- Set `NODE_ENV=production` to enforce authentication on protected endpoints

### API Authentication

Protected endpoints require a `Bearer` token in the `Authorization` header:

```
Authorization: Bearer <SYNC_TOKEN>
```

### CORS

The server restricts CORS origins in production. Set `ALLOWED_ORIGINS` to a comma-separated list of allowed origins.

## Known Security Configurations

- All wallet mutation endpoints are protected by `requireToken` middleware when `NODE_ENV=production`
- The `blockchain/mint` endpoint requires authentication in all environments when `SYNC_TOKEN` is set
- In-memory data stores (auctions, NFT stamps, users) are for demonstration — use a database in production
