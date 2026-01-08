# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.5.x   | :white_check_mark: |
| < 1.5   | :x:                |

## Reporting a Vulnerability

We take the security of English Optimizer CLI seriously. If you believe you have found a security vulnerability, please report it to us as described below.

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to:
- Create a private security advisory on GitHub: https://github.com/[your-username]/english-optimizer-cli/security/advisories/new

Please include the following information:
- Type of issue (e.g. buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

## What to Expect

- You will receive a response from us within 48 hours
- We will work with you to understand and validate the issue
- We will develop and release a fix as quickly as possible
- We will publicly acknowledge your responsible disclosure, if you wish

## Security Best Practices for Users

When using English Optimizer CLI:

1. **API Keys**: Never commit API keys to version control. Use `.env` files (which are gitignored by default)
2. **Updates**: Keep the CLI updated to the latest version to get security patches
3. **Permissions**: Be cautious when granting file system permissions
4. **Network**: If using cloud APIs, ensure you're using HTTPS endpoints
5. **Dependencies**: Regularly check for and update dependencies with known vulnerabilities

## Known Security Considerations

- API keys are stored in plain text in configuration files (`~/.english-optimizer/config.yaml` or `.env`)
- Ensure proper file permissions on configuration files containing API keys
- Be cautious when sharing history files as they may contain sensitive text

Thank you for helping keep English Optimizer CLI and its users safe!
