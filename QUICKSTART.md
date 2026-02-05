# Quick Start Guide

Get the demo running in 5 minutes!

---

## Prerequisites

1. **Node.js 18+** installed
2. **Two Base Sepolia wallets** with:
   - Testnet ETH for gas ([get here](https://www.base.org/faucet))
   - Testnet USDC for payments ([get here](https://faucet.circle.com/))

---

## Installation

```bash
# 1. Clone repository
git clone <repository-url>
cd openclaw-usdc-hackathon-2026

# 2. Run setup script
bash scripts/setup.sh

# This will:
# - Install dependencies
# - Build TypeScript
# - Create .env from template
```

---

## Configuration

Edit `.env` with your wallet details:

```bash
# Agent A (pays for services)
AGENT_A_PRIVATE_KEY=0x...  # Your private key

# Agent B (provides services)
AGENT_B_PRIVATE_KEY=0x...  # Your private key
AGENT_B_ADDRESS=0x...      # Your address (payment recipient)
AGENT_B_PORT=3001
```

**Security:** Never commit `.env` to git!

---

## Running the Demo

### Terminal 1: Start Agent B (Service Provider)

```bash
npm run agent-b
```

You should see:
```
╔════════════════════════════════════════════════╗
║  Agent Beta - Service Provider Agent           ║
╚════════════════════════════════════════════════╝

✓ Agent Beta is running on http://localhost:3001

Available services:
  POST /task/fetch        - Data fetch service ($0.01 USDC)
  POST /task/compute      - Computation service ($0.05 USDC)
  POST /task/generate     - Content generation ($0.10 USDC)
```

### Terminal 2: Run Agent A (Requester)

```bash
npm run agent-a -- demo
```

This runs the full demo:
1. Discovers services from Agent B
2. Requests data fetch service → pays $0.01 USDC
3. Requests computation service → pays $0.05 USDC
4. Requests content generation → pays $0.10 USDC

**Total cost:** $0.16 USDC + ~$0.006 gas

---

## Verify on Blockchain

All transactions are recorded on Base Sepolia:

1. Look for transaction hashes in the output
2. Visit: https://sepolia.basescan.org/
3. Search for:
   - Your wallet address
   - Transaction hashes
   - Agent B's address

---

## Individual Services

Try each service separately:

### Data Fetch ($0.01 USDC)
```bash
npm run agent-a -- fetch https://api.coinbase.com/v2/exchange-rates?currency=ETH
```

### Computation ($0.05 USDC)
```bash
npm run agent-a -- compute sum 100,200,300,400,500
npm run agent-a -- compute average 10,20,30,40,50
npm run agent-a -- compute max 15,42,8,99,23
```

### Content Generation ($0.10 USDC)
```bash
npm run agent-a -- generate "the future of AI agents"
```

---

## Testing

Run the automated test suite:

```bash
npm test
```

This verifies:
- ✅ Agent B is reachable
- ✅ Service discovery works
- ✅ Payment flow completes
- ✅ All three services function correctly

---

## Troubleshooting

### "AGENT_A_PRIVATE_KEY not set in .env"
→ Edit `.env` and add your private key

### "Agent B not reachable"
→ Ensure Agent B is running: `npm run agent-b`

### "Insufficient funds"
→ Get testnet tokens:
- ETH: https://www.base.org/faucet
- USDC: https://faucet.circle.com/

### "Payment verification failed"
→ Wait 5 seconds for blockchain confirmation, then retry

---

## What's Next?

1. **Read the docs:**
   - `README.md` - Full documentation
   - `docs/ARCHITECTURE.md` - Technical details
   - `docs/PAYMENT-FLOW.md` - How payments work

2. **Try examples:**
   - `examples/README.md` - Usage examples
   - Run: `bash examples/01-data-fetch-example.sh`

3. **Explore the code:**
   - `src/agent-a-requester.ts` - Client implementation
   - `src/agent-b-performer.ts` - Server implementation

4. **Watch the demo video:**
   - [Link to video] (coming soon)

---

## Architecture Overview

```
Agent A (Requester)  →  x402 Protocol  →  Agent B (Performer)
       ↓                                          ↓
   Pay USDC          →    Base Sepolia    ←   Verify Payment
```

**Flow:**
1. Agent A requests service
2. Agent B responds: "402 Payment Required"
3. Agent A transfers USDC on blockchain
4. Agent A retries with payment proof
5. Agent B verifies payment on-chain
6. Agent B delivers service

---

## Cost Breakdown

| Service | USDC | Gas | Total |
|---------|------|-----|-------|
| Data Fetch | $0.01 | ~$0.002 | ~$0.012 |
| Computation | $0.05 | ~$0.002 | ~$0.052 |
| Content Gen | $0.10 | ~$0.002 | ~$0.102 |
| **Full Demo** | **$0.16** | **~$0.006** | **~$0.166** |

---

## Support

- **Issues:** GitHub Issues
- **Email:** team@reflectt.ai
- **Documentation:** `docs/` directory

---

**You're all set! 🎉**

Run `npm run agent-a -- demo` and watch agents exchange services for USDC!

---

*Built for OpenClaw USDC Hackathon 2026*
