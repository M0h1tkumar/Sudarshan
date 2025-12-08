# Contributing to Sudrashan AI

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/Sudarshan.git`
3. Create a branch: `git checkout -b feature/your-feature`
4. Make your changes
5. Run tests: `npm test`
6. Commit: `git commit -m "Add feature"`
7. Push: `git push origin feature/your-feature`
8. Create a Pull Request

## Development Setup

```bash
npm install
cp .env.example .env
npm run db:migrate
npm run dev
```

## Code Standards

### Style Guide
- Use ESLint configuration
- Run `npm run lint:fix` before committing
- Format with Prettier: `npm run format`
- Follow existing code patterns

### Commit Messages
```
feat: Add new feature
fix: Fix bug
docs: Update documentation
test: Add tests
refactor: Refactor code
perf: Performance improvement
chore: Maintenance tasks
```

## Testing

- Write tests for new features
- Maintain >80% code coverage
- Run `npm test` before submitting PR
- Integration tests in `tests/integration.test.js`

## Security

- Never commit API keys or secrets
- Use environment variables
- Report security issues to security@sudrashan.com
- Follow OWASP guidelines

## Pull Request Process

1. Update documentation
2. Add tests for new features
3. Ensure all tests pass
4. Update CHANGELOG.md
5. Request review from maintainers

## Code Review

- Be respectful and constructive
- Focus on code quality and security
- Suggest improvements
- Approve when ready

## License

By contributing, you agree to the MIT License terms.
