# Contributing to Agent-to-Agent USDC Payments Demo

Thank you for your interest in contributing! This is a hackathon submission, but we welcome improvements, bug fixes, and new features.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** installed
- **Git** for version control
- **Base Sepolia testnet** access (for testing payments)
- **TypeScript** knowledge (helpful but not required)

### Setup

1. **Fork the repository**
   ```bash
   # Via GitHub UI: Click "Fork" button
   # Or via CLI:
   gh repo fork reflectt/openclaw-usdc-hackathon-2026 --clone
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/openclaw-usdc-hackathon-2026.git
   cd openclaw-usdc-hackathon-2026
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your testnet credentials
   ```

5. **Build the project**
   ```bash
   npm run build
   ```

6. **Run tests**
   ```bash
   npm test
   ```

---

## 🛠️ Development Workflow

### 1. Create a Feature Branch

Always work in a feature branch, never directly in `main`:

```bash
git checkout -b feature/your-feature-name
# Or for bug fixes:
git checkout -b fix/bug-description
```

**Branch naming conventions:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/improvements

### 2. Make Your Changes

- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Update documentation if needed

### 3. Test Your Changes

```bash
# Build TypeScript
npm run build

# Run tests
npm test

# Test manually
npm run agent-b  # In one terminal
npm run agent-a -- demo  # In another
```

### 4. Commit Your Changes

Write clear, descriptive commit messages:

```bash
git add .
git commit -m "feat: add escrow payment option

- Add smart contract escrow logic
- Update payment flow to support escrow
- Add tests for escrow functionality"
```

**Commit message format:**
```
<type>: <short description>

<optional longer description>
<optional list of changes>
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `test:` - Test additions/improvements
- `chore:` - Build process, dependencies, etc.

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 6. Open a Pull Request

1. Go to the original repository on GitHub
2. Click "New Pull Request"
3. Select your fork and branch
4. Fill out the PR template:
   - **Title:** Clear, descriptive summary
   - **Description:** What changed and why
   - **Testing:** How you tested the changes
   - **Screenshots:** If UI/output changed

---

## 📋 Code Style Guidelines

### TypeScript

- Use **TypeScript strict mode**
- Prefer `const` over `let`
- Use descriptive variable names
- Add type annotations for function parameters and return values

**Good:**
```typescript
async function fetchData(url: string): Promise<ResponseData> {
  const response = await fetch(url);
  return await response.json();
}
```

**Avoid:**
```typescript
async function f(u) {
  let r = await fetch(u);
  return await r.json();
}
```

### File Organization

```
src/
├── agent-a-requester.ts    # Agent A implementation
├── agent-b-performer.ts    # Agent B implementation
├── types/                  # Type definitions
│   └── index.ts
├── utils/                  # Utility functions
│   ├── payment.ts
│   └── logger.ts
└── test/                   # Tests
    └── e2e-test.ts
```

### Comments

Add comments for:
- Complex algorithms
- x402 protocol interactions
- Blockchain transaction logic
- Non-obvious business logic

```typescript
// Verify the payment transaction on-chain
// This checks:
// - Transaction exists and is confirmed
// - Recipient matches our address
// - Amount is sufficient
// - Token is USDC (not ETH or other token)
const isValid = await verifyPayment(txHash);
```

### Error Handling

Always handle errors gracefully:

```typescript
try {
  const result = await performService();
  return result;
} catch (error) {
  console.error(`Service failed: ${error.message}`);
  throw new ServiceError('Failed to perform service', { cause: error });
}
```

---

## 🧪 Testing Guidelines

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
tsx src/test/specific-test.ts
```

### Writing Tests

Add tests for:
- New features
- Bug fixes (regression tests)
- Edge cases

Example test structure:
```typescript
async function testDataFetchService() {
  console.log('Testing data fetch service...');
  
  const result = await agentA.requestService('fetch', {
    url: 'https://api.example.com/data'
  });
  
  if (!result.success) {
    throw new Error('Data fetch failed');
  }
  
  console.log('✅ Data fetch test passed');
}
```

---

## 📝 Documentation Guidelines

### When to Update Documentation

Update docs when you:
- Add new features
- Change existing behavior
- Fix bugs that affect usage
- Improve setup/configuration

### Which Files to Update

| Change | Files to Update |
|--------|-----------------|
| New feature | README.md, docs/ARCHITECTURE.md |
| Configuration change | README.md, .env.example, QUICKSTART.md |
| API change | docs/API.md (if exists) |
| Bug fix | Potentially none (unless usage changes) |

### Documentation Style

- **Clear and concise** - Get to the point
- **Examples** - Show, don't just tell
- **Complete** - Don't assume knowledge
- **Tested** - Verify all examples work

---

## 🐛 Bug Reports

### Before Submitting

1. **Search existing issues** - Your bug might already be reported
2. **Test on latest version** - Update dependencies and try again
3. **Minimal reproduction** - Isolate the issue

### What to Include

Open an issue with:

**Title:** Short, descriptive summary
```
[BUG] Payment verification fails for large amounts
```

**Description:**
```markdown
**Describe the bug**
Payment verification fails when amount is >$1 USDC.

**To Reproduce**
1. Set payment amount to $2 USDC
2. Run `npm run agent-a -- fetch URL`
3. See error: "Amount exceeds maximum"

**Expected behavior**
Should accept any amount if wallet has sufficient funds.

**Environment:**
- OS: macOS 13.4
- Node: v18.17.0
- Package version: 1.0.0

**Additional context**
Works fine with amounts <$1. Might be related to MAX_PAYMENT_AMOUNT config.
```

---

## 💡 Feature Requests

### Before Requesting

1. **Check existing issues** - Someone might have requested it
2. **Consider scope** - Is it aligned with project goals?
3. **Think through implementation** - How would it work?

### What to Include

**Title:** Clear feature summary
```
[FEATURE] Add subscription-based payments
```

**Description:**
```markdown
**Problem**
Currently only supports one-time payments. For ongoing services, users need to pay each time.

**Proposed solution**
Add subscription payment option:
- Monthly/weekly/daily billing
- Automatic renewal
- Cancel anytime

**Alternatives considered**
- Payment batching (doesn't solve recurring need)
- Escrow (too complex for this use case)

**Implementation ideas**
- New service type: `subscription`
- Store subscription state in contract
- Cron job for renewal checks
```

---

## 🏗️ Architecture Decisions

When making significant changes, consider:

### 1. Backward Compatibility
- Will this break existing users?
- Can we provide migration path?

### 2. Security
- Does this introduce vulnerabilities?
- Have we handled edge cases?
- Is sensitive data protected?

### 3. Performance
- Will this scale?
- Are there bottlenecks?
- Can we optimize later?

### 4. Maintainability
- Is the code readable?
- Is it well-documented?
- Will future contributors understand it?

---

## 🤝 Code Review Process

### For Contributors

After opening a PR:
1. **Wait for review** (usually 1-3 days)
2. **Address feedback** - Make requested changes
3. **Update PR** - Push new commits
4. **Be patient and respectful**

### For Reviewers

When reviewing PRs:
- ✅ **Be kind and constructive**
- ✅ **Explain why** changes are needed
- ✅ **Ask questions** if unclear
- ✅ **Approve when ready**
- ❌ **Don't be pedantic** about minor style issues
- ❌ **Don't block** on personal preferences

---

## 🎯 Priorities

### High Priority
- **Security fixes** - Payment vulnerabilities, key exposure
- **Critical bugs** - Broken core functionality
- **Documentation errors** - Misleading setup instructions

### Medium Priority
- **Feature requests** - Aligned with project goals
- **Performance improvements** - Noticeable speed gains
- **UX improvements** - Better developer experience

### Low Priority
- **Refactoring** - Code cleanup (unless blocking new features)
- **Nice-to-haves** - Non-essential features
- **Cosmetic changes** - Minor style tweaks

---

## 🏆 Recognition

Contributors will be:
- **Listed in README** - Contributors section
- **Mentioned in releases** - Release notes
- **Credited in commits** - Git history
- **Thanked publicly** - Social media shoutouts

---

## 📞 Getting Help

Stuck? Reach out:

- **GitHub Discussions** - Ask questions, share ideas
- **GitHub Issues** - Report bugs, request features
- **Email:** team@reflectt.ai
- **Twitter:** @reflectt_labs

---

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for everyone, regardless of:
- Gender, gender identity and expression
- Sexual orientation
- Disability
- Physical appearance
- Race, ethnicity, nationality
- Age
- Religion (or lack thereof)

### Expected Behavior

- **Be respectful** - Treat everyone with kindness
- **Be collaborative** - Work together toward common goals
- **Be professional** - Keep discussions constructive
- **Be inclusive** - Welcome newcomers

### Unacceptable Behavior

- Harassment, discrimination, or hate speech
- Personal attacks or insults
- Spam or off-topic content
- Sharing others' private information

### Enforcement

Violations may result in:
1. Warning
2. Temporary ban
3. Permanent ban

Report violations to: team@reflectt.ai

---

## 📚 Additional Resources

### Learning Resources
- **x402 Protocol:** https://github.com/coinbase/x402
- **Base Network:** https://docs.base.org/
- **Viem (Ethereum library):** https://viem.sh/
- **TypeScript:** https://www.typescriptlang.org/docs/

### Related Projects
- **Agent economies:** https://thecolony.cc/
- **Web3 payments:** https://pay.coinbase.com/
- **Multi-agent systems:** https://autogen.dev/

---

## ❓ FAQ

**Q: Can I use this code in my own project?**  
A: Yes! It's MIT licensed. Attribution appreciated but not required.

**Q: How do I add a new service type?**  
A: See `src/agent-b-performer.ts`, add a new route with `@x402/express` middleware.

**Q: Can this work on mainnet with real USDC?**  
A: Yes, but be very careful. Add more security, testing, and audit code first.

**Q: How do I report a security vulnerability?**  
A: Email team@reflectt.ai directly (don't open a public issue).

---

**Thank you for contributing!** 🙏

Every improvement, no matter how small, helps make autonomous agent economies a reality.
