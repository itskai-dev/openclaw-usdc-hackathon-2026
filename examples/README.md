# Usage Examples

This directory contains example scripts demonstrating the three services provided by Agent B.

## Prerequisites

1. **Agent B must be running:**
   ```bash
   npm run agent-b
   ```

2. **Agent A wallet must have:**
   - Base Sepolia ETH (for gas)
   - Base Sepolia USDC (for payments)

3. **Configuration:**
   - `.env` file must be set up with private keys and addresses

---

## Examples

### Example 1: Data Fetch Service ($0.01 USDC)

**Use case:** API aggregation, web scraping, data collection

```bash
bash examples/01-data-fetch-example.sh
```

Or run directly:
```bash
npm run agent-a -- fetch https://api.coinbase.com/v2/exchange-rates?currency=ETH
```

**What it does:**
- Agent A requests data from a URL
- Agent B fetches the data and returns it
- Payment: $0.01 USDC

**Real-world applications:**
- Web scraping services
- API aggregation
- Data collection and monitoring
- Price feeds and market data

---

### Example 2: Computation Service ($0.05 USDC)

**Use case:** Mathematical analysis, statistical processing, data analytics

```bash
bash examples/02-computation-example.sh
```

Or run directly:
```bash
npm run agent-a -- compute sum 100,200,300,400,500
```

**What it does:**
- Agent A provides a dataset and operation
- Agent B performs the calculation
- Payment: $0.05 USDC

**Operations available:**
- `sum` - Add all numbers
- `average` - Calculate mean
- `max` - Find maximum value
- `min` - Find minimum value
- `product` - Multiply all numbers

**Real-world applications:**
- Statistical analysis services
- Financial calculations
- Data processing pipelines
- Scientific computing

---

### Example 3: Content Generation Service ($0.10 USDC)

**Use case:** Content creation, summarization, analysis

```bash
bash examples/03-content-generation-example.sh
```

Or run directly:
```bash
npm run agent-a -- generate "the future of agent-to-agent economies"
```

**What it does:**
- Agent A provides a prompt
- Agent B generates text content
- Payment: $0.10 USDC

**Content types:**
- `description` - Descriptive text
- `summary` - Summarized content
- `analysis` - Analytical text

**Real-world applications:**
- Content creation services
- Document summarization
- Report generation
- Marketing copy writing

---

## Full Demo

Run all three examples in sequence:

```bash
npm run agent-a -- demo
```

This will:
1. Discover all available services
2. Execute data fetch ($0.01)
3. Execute computation ($0.05)
4. Execute content generation ($0.10)

**Total cost: $0.16 USDC + gas fees**

---

## Custom Requests

### Data Fetch
```bash
npm run agent-a -- fetch <url>
```

Example:
```bash
npm run agent-a -- fetch https://api.github.com/repos/bitcoin/bitcoin
```

### Computation
```bash
npm run agent-a -- compute <operation> <comma-separated-values>
```

Examples:
```bash
npm run agent-a -- compute average 10,20,30,40,50
npm run agent-a -- compute max 15,42,8,99,23
npm run agent-a -- compute product 2,3,4,5
```

### Content Generation
```bash
npm run agent-a -- generate "<prompt>" [type]
```

Examples:
```bash
npm run agent-a -- generate "AI-powered autonomous agents"
npm run agent-a -- generate "blockchain technology" summary
npm run agent-a -- generate "decentralized finance" analysis
```

---

## Monitoring Transactions

All transactions are recorded on Base Sepolia testnet. You can view them at:

**BaseScan (Base Sepolia Explorer):**
https://sepolia.basescan.org/

Search for:
- Your wallet address (Agent A)
- Agent B's address
- Transaction hashes (shown in output)

---

## Troubleshooting

### "Insufficient funds" error
- Get testnet ETH: https://www.base.org/faucet
- Get testnet USDC: https://faucet.circle.com/

### "Agent B not reachable" error
- Ensure Agent B is running: `npm run agent-b`
- Check the port (default: 3001)
- Verify `AGENT_B_URL` in `.env`

### "Payment verification failed" error
- Wait for transaction confirmation (~5 seconds)
- Check transaction on BaseScan
- Ensure correct USDC contract and network

---

## Cost Summary

| Service | Price | Gas (est.) | Total |
|---------|-------|------------|-------|
| Data Fetch | $0.01 USDC | ~$0.002 | $0.012 |
| Computation | $0.05 USDC | ~$0.002 | $0.052 |
| Content Gen | $0.10 USDC | ~$0.002 | $0.102 |

*Gas fees on Base Sepolia are typically $0.001-0.002 per transaction*

---

## Next Steps

1. Try all three examples
2. Experiment with custom requests
3. Monitor transactions on BaseScan
4. Read the architecture docs: `docs/ARCHITECTURE.md`
5. Understand the payment flow: `docs/PAYMENT-FLOW.md`

---

**Built for OpenClaw USDC Hackathon 2026**
