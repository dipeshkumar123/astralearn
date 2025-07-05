# Contributing to AstraLearn

Thank you for your interest in contributing to AstraLearn! We welcome all kinds of contributions, including bug fixes, new features, documentation improvements, and more.

## Coding Standards
- **Language:** Use JavaScript/TypeScript (Node.js/React) for code, Markdown for docs.
- **Formatting:** Use [Prettier](https://prettier.io/) and [ESLint](https://eslint.org/) (config provided in the repo).
- **Naming:** Use descriptive variable, function, and component names. Follow camelCase for variables/functions and PascalCase for components/classes.
- **Comments:** Write clear, concise comments for complex logic. Use JSDoc/TSDoc for functions and classes where appropriate.
- **Tests:** Add/maintain tests for new or changed code. Use existing test frameworks (e.g., Jest).

## Commit Message Format
Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <short summary>

[optional body]
[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only changes
- `style`: Formatting, missing semi colons, etc; no code change
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `test`: Adding or correcting tests
- `chore`: Changes to the build process or auxiliary tools

**Examples:**
- `feat(auth): add Google OAuth integration`
- `fix(api): correct user progress calculation`
- `docs(readme): update quickstart guide`

## Pull Request & Review Process
1. **Fork** the repository and create a new branch (`feature/your-feature` or `fix/your-bug`).
2. **Write code** following the standards above. Add/modify tests as needed.
3. **Test** your changes locally. Ensure all tests pass (`npm test`).
4. **Push** your branch and open a **Pull Request** (PR) against the `main` branch.
5. **Describe** your changes clearly in the PR description. Link related issues if applicable.
6. **Review:**
   - At least one maintainer must review and approve your PR.
   - Address any requested changes.
   - PRs may be squashed and merged for a clean history.

## Kubernetes Secrets Management

- **Never commit raw Kubernetes secrets or sensitive values to the repository.**
- For production, use tools like [Sealed Secrets](https://github.com/bitnami-labs/sealed-secrets), [External Secrets Operator](https://external-secrets.io/), or your cloud provider's secret manager (e.g., AWS Secrets Manager, Azure Key Vault, Google Secret Manager).
- Add all secret files (e.g., `secrets.yaml`, `.env`, `*.secret.yaml`) to `.gitignore`.
- If you need to share secrets for development, use encrypted channels or environment variable managers, never plain text in version control.

## Code of Conduct
Please be respectful and inclusive. See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) if available.

## Questions?
- For help, open a [GitHub Issue](https://github.com/dipeshkumar123/astralearn/issues) or contact the maintainers listed in the README.

Thank you for helping make AstraLearn better!
