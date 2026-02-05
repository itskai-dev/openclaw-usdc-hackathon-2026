# Testnet Validation Guide

This guide walks through testing the demo with real Base Sepolia USDC to verify all functionality works on-chain.

---

## Prerequisites

### 1. Get Two Wallets

You need **two separate wallets** for Agent A and Agent B:

**Option A: Create new wallets**
```bash
# Generate private keys using cast (Foundry)
cast wallet new

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option B: Use existing testnet wallets**
- MetaMask test accounts
- Burner wallets (not for production!)

**Save the private keys securely!**

---

### 2. Fund Wallets with Base Sepolia ETH

Both wallets need ETH for gas fees (~$0.01 worth each).

**Faucets:**
1. **Base Faucet:** https://www.base.org/faucet
   - Requires sign-in (GitHub or email)
   - Gives 0.1 ETH on Base Sepolia
   - Limit: Once per 24 hours

2. **Alchemy Faucet:** https://sepoliafaucet.com/
   - For Ethereum Sepolia
   - Then bridge to Base Sepolia via https://bridge.base.org/

3. **Coinbase Wallet:** 
   - Some users get free testnet ETH

**Verify you received ETH:**
```bash
# Check balance on BaseScan
# https://sepolia.basescan.org/address/YOUR_ADDRESS
```

---

### 3. Fund Wallets with Base Sepolia USDC

Both wallets need testnet USDC:
- **Agent A:** ~$1 USDC (for paying services)
- **Agent B:** $0 (will receive payments)

**Circle Faucet:** https://faucet.circle.com/

**Steps:**
1. Visit the faucet
2. Select "Base Sepolia" network
3. Paste Agent A wallet address
4. Click "Get USDC"
5. Wait ~30 seconds for confirmation

**USDC Contract on Base Sepolia:**
```
0x036CbD53842c5426634e7929541eC2318f3dCF7e
```

**Verify USDC balance:**
```bash
# On BaseScan, check the "Token" tab for your address
# Or use cast:
cast call 0x036CbD53842c5426634e7929541eC2318f3dCF7e \
  "balanceOf(address)(uint256)" \
  YOUR_ADDRESS \
  --rpc-url https://sepolia.base.org
```

---

## Configuration

### 4. Set up .env file

Copy the example:
```bash
cd projects/usdc-hackathon-submission
cp .env.example .env
```

Edit `.env`:
```bash
# Agent A (Requester) - The wallet that PAYS
AGENT_A_PRIVATE_KEY=0xabcdef1234567890...  # Your private key
AGENT_A_NAME="Agent Alpha"

# Agent B (Performer) - The wallet that RECEIVES
AGENT_B_PRIVATE_KEY=0x1234567890abcdef...  # Different private key
AGENT_B_ADDRESS=0x742d35Cc6634C0532925a3b8...  # Agent B's address (public)
AGENT_B_PORT=3001
AGENT_B_NAME="Agent Beta"

# Network Configuration
NETWORK=eip155:84532  # Base Sepolia chain ID
RPC_URL=https://sepolia.base.org

# x402 Facilitator (optional, uses default if not set)
FACILITATOR_URL=https://x402.coinbase.com/v1

# Demo Configuration
AUTO_APPROVE_PAYMENTS=true  # Set to false to manually approve each payment
MAX_PAYMENT_AMOUNT=1.00     # Safety limit: max $1 per transaction
```

**Security check:**
```bash
# Verify .env is in .gitignore
cat .gitignore | grep .env
# Should output: .env

# NEVER commit .env to Git!
```

---

## Testing

### 5. Install Dependencies

```bash
npm install
npm run build
```

Expected output:
```
added 150 packages, and audited 151 packages in 5s
```

---

### 6. Test Agent B (Service Provider)

Start Agent B in a dedicated terminal:

```bash
npm run agent-b
```

**Expected output:**
```
╔════════════════════════════════════════════════╗
║  Agent Beta - Service Provider Agent           ║
╚════════════════════════════════════════════════╝

Configuration:
  Network: Base Sepolia (eip155:84532)
  RPC: https://sepolia.base.org
  USDC: 0x036CbD53842c5426634e7929541eC2318f3dCF7e

💰 Payment recipient: 0x742d35Cc6634C0532925a3b8...
✓ x402 resource server initialized

✓ Agent Beta is running on http://localhost:3001

Available services:
  GET  /info              - Agent information (free)
  POST /task/fetch        - Data fetch service ($0.01 USDC)
  POST /task/compute      - Computation service ($0.05 USDC)
  POST /task/generate     - Content generation ($0.10 USDC)

Ready to accept payments! 💎
```

**Verify server is responding:**
```bash
# In another terminal
curl http://localhost:3001/info
```

Expected:
```json
{
  "name": "Agent Beta",
  "services": [
    {"endpoint": "/task/fetch", "price": "0.01", "description": "Fetch data from any URL"},
    {"endpoint": "/task/compute", "price": "0.05", "description": "Perform computations"},
    {"endpoint": "/task/generate", "price": "0.10", "description": "Generate content"}
  ],
  "paymentAddress": "0x742d35Cc6634C0532925a3b8...",
  "network": "eip155:84532"
}
```

---

### 7. Test Service Discovery (Agent A)

In a **new terminal**, test service discovery:

```bash
npm run agent-a -- discover
```

**Expected output:**
```
🔍 Discovering services from Agent Beta...

╔════════════════════════════════════════════════╗
║  Agent Beta - Available Services                ║
╠════════════════════════════════════════════════╣
║  1. Data Fetch       → $0.01 USDC              ║
║     POST /task/fetch                            ║
║     Fetch data from any URL                     ║
║                                                 ║
║  2. Computation      → $0.05 USDC              ║
║     POST /task/compute                          ║
║     Perform mathematical operations             ║
║                                                 ║
║  3. Content Gen      → $0.10 USDC              ║
║     POST /task/generate                         ║
║     Generate text content                       ║
╚════════════════════════════════════════════════╝

Payment address: 0x742d35Cc6634C0532925a3b8...
Network: Base Sepolia (84532)
```

✅ **Success criterion:** Agent A can query Agent B and see all services

---

### 8. Test Individual Services

#### Test 1: Data Fetch ($0.01 USDC)

```bash
npm run agent-a -- fetch https://api.coinbase.com/v2/exchange-rates?currency=ETH
```

**What to watch for:**

1. **402 Response**
```
📤 Requesting data fetch service...
💸 Payment required: 0.01 USDC
   Recipient: 0x742d35Cc6634C0532925a3b8...
   Network: Base Sepolia
```

2. **Payment Sent**
```
💰 Sending USDC payment...
   Amount: 0.01 USDC
   To: 0x742d35Cc6634C0532925a3b8...
⏳ Waiting for confirmation...
```

3. **Transaction Confirmed**
```
✅ Payment confirmed!
   TX Hash: 0xabc123def456789...
   View on BaseScan: https://sepolia.basescan.org/tx/0xabc123...
```

4. **Service Delivered**
```
🔄 Retrying request with payment proof...
✅ Service complete!

Result:
{
  "data": {
    "currency": "ETH",
    "rates": {
      "USD": "2450.23",
      "EUR": "2234.11",
      ...
    }
  }
}
```

**Verify on BaseScan:**
1. Click the BaseScan link or visit manually
2. Check transaction details:
   - ✅ Status: Success
   - ✅ From: Agent A address
   - ✅ To: Agent B address  
   - ✅ Token: USDC (0x036CbD...)
   - ✅ Amount: 0.01 USDC

**Copy transaction hash** to include in documentation!

---

#### Test 2: Computation ($0.05 USDC)

```bash
npm run agent-a -- compute sum 100,200,300,400,500
```

**Expected flow:**
1. 402 Payment Required ($0.05)
2. USDC payment sent
3. Transaction confirmed
4. Service executes: `sum([100,200,300,400,500]) = 1500`
5. Result returned

**Verify:**
- [ ] Different transaction hash than Test 1
- [ ] Amount is 0.05 USDC
- [ ] Correct computation result

---

#### Test 3: Content Generation ($0.10 USDC)

```bash
npm run agent-a -- generate "the future of agent-to-agent economies"
```

**Expected flow:**
1. 402 Payment Required ($0.10)
2. USDC payment sent (largest amount)
3. Transaction confirmed
4. Service generates ~200-300 words of content
5. Result returned

**Verify:**
- [ ] Third unique transaction hash
- [ ] Amount is 0.10 USDC
- [ ] Generated content is relevant to prompt

---

### 9. Run Full Demo

Test all three services in sequence:

```bash
npm run agent-a -- demo
```

**Expected summary:**
```
╔════════════════════════════════════════════════╗
║  Demo Complete!                                 ║
╠════════════════════════════════════════════════╣
║  Services Used: 3                               ║
║  Total Paid: $0.16 USDC                         ║
║  Gas Fees: ~$0.006 (estimate)                   ║
║  Transactions: 3                                ║
║                                                 ║
║  Transaction Hashes:                            ║
║  1. 0xabc123... (Data fetch)                    ║
║  2. 0xdef456... (Computation)                   ║
║  3. 0xghi789... (Content gen)                   ║
╚════════════════════════════════════════════════╝

View all transactions on BaseScan:
https://sepolia.basescan.org/address/0x742d35Cc6634C0532925a3b8...
```

**Verify:**
- [ ] All 3 transactions visible on BaseScan
- [ ] Agent B received total of 0.16 USDC
- [ ] Agent A paid 0.16 USDC + gas fees
- [ ] All services executed successfully

---

### 10. Run E2E Test Suite

Automated test that verifies everything:

```bash
npm test
```

**Expected output:**
```
🧪 Running End-to-End Tests...

✓ Test 1: Service Discovery
  → Found 3 services from Agent B

✓ Test 2: Data Fetch Service
  → Paid 0.01 USDC
  → TX: 0xabc123...
  → Service delivered successfully

✓ Test 3: Computation Service
  → Paid 0.05 USDC
  → TX: 0xdef456...
  → Computation result: 1500

✓ Test 4: Content Generation Service
  → Paid 0.10 USDC
  → TX: 0xghi789...
  → Generated 250 words

╔════════════════════════════════════════════════╗
║  All Tests Passed! ✅                           ║
╠════════════════════════════════════════════════╣
║  Tests Run: 4/4                                 ║
║  Total Paid: $0.16 USDC                         ║
║  Duration: 45 seconds                           ║
╚════════════════════════════════════════════════╝
```

---

## Documentation

### 11. Document Transaction Hashes

Update README.md with real transaction examples:

```markdown
## 🧪 Verified Transactions

All payments verified on Base Sepolia blockchain:

| Service | Amount | TX Hash | BaseScan |
|---------|--------|---------|----------|
| Data Fetch | $0.01 | `0xabc123...` | [View](https://sepolia.basescan.org/tx/0xabc123...) |
| Computation | $0.05 | `0xdef456...` | [View](https://sepolia.basescan.org/tx/0xdef456...) |
| Content Gen | $0.10 | `0xghi789...` | [View](https://sepolia.basescan.org/tx/0xghi789...) |

**Total:** $0.16 USDC in 3 transactions
```

### 12. Take Screenshots

Capture these for the README:

1. **Agent B startup terminal**
   - Shows service catalog
   - Payment address
   - Ready status

2. **Payment flow in action**
   - 402 response
   - Payment sending
   - Transaction confirmation
   - Service delivery

3. **BaseScan transaction**
   - Transaction details page
   - Showing Success status
   - USDC transfer amount
   - From/To addresses

4. **Demo completion summary**
   - Final statistics
   - All transaction hashes
   - Success confirmation

**Save screenshots to:** `assets/screenshots/`

---

## Troubleshooting

### Issue: "Insufficient funds"

**Cause:** Wallet doesn't have enough USDC or ETH

**Solution:**
```bash
# Check USDC balance
cast call 0x036CbD53842c5426634e7929541eC2318f3dCF7e \
  "balanceOf(address)(uint256)" \
  YOUR_AGENT_A_ADDRESS \
  --rpc-url https://sepolia.base.org

# Check ETH balance
cast balance YOUR_AGENT_A_ADDRESS \
  --rpc-url https://sepolia.base.org

# If low, get more from faucets
```

---

### Issue: "Transaction failed"

**Cause:** Gas price spike, network congestion, or invalid transaction

**Solution:**
1. Check transaction on BaseScan for error message
2. Try again (network might be congested)
3. Increase gas limit in code if needed
4. Verify wallet has enough ETH for gas

---

### Issue: "Payment verification failed"

**Cause:** Transaction not confirmed yet, or wrong network

**Solution:**
1. Wait longer for confirmation (Base Sepolia can take 2-10 seconds)
2. Verify you're on Base Sepolia (not Ethereum Sepolia)
3. Check RPC URL is correct: `https://sepolia.base.org`
4. Try alternative RPC: `https://base-sepolia.g.alchemy.com/v2/...`

---

### Issue: "Connection refused to Agent B"

**Cause:** Agent B not running or wrong port

**Solution:**
```bash
# Check if Agent B is running
lsof -i :3001

# Restart Agent B
npm run agent-b

# Try different port in .env
AGENT_B_PORT=3002
```

---

### Issue: "x402 protocol error"

**Cause:** Network issue, facilitator down, or SDK version mismatch

**Solution:**
1. Check internet connection
2. Verify x402 facilitator is reachable:
   ```bash
   curl https://x402.coinbase.com/v1/health
   ```
3. Update dependencies:
   ```bash
   npm update @x402/core @x402/fetch @x402/express @x402/evm
   ```

---

## Validation Checklist

Before submitting, verify:

- [ ] Agent B starts successfully
- [ ] Service discovery works
- [ ] Data fetch service (3 transactions total)
- [ ] Computation service (test works with payment)
- [ ] Content generation service (test works with payment)
- [ ] Full demo runs end-to-end
- [ ] E2E test suite passes
- [ ] All transactions visible on BaseScan
- [ ] Transaction hashes documented in README
- [ ] Screenshots captured
- [ ] No private keys in any files
- [ ] .env not committed to Git

---

## Post-Validation

### Update Documentation

1. Add transaction hashes to README.md
2. Add screenshots to assets/screenshots/
3. Update SUBMISSION.md with BaseScan links
4. Create release notes with verified transactions

### Share Results

Tweet example:
```
✅ Just validated our @OpenClaw USDC Hackathon demo on Base Sepolia!

🤖 2 AI agents successfully exchanged services for USDC
💰 3 transactions, $0.16 total, all verified on-chain

Check the transactions:
🔗 sepolia.basescan.org/address/0x742d35Cc...

#BuildOnBase #USDC #AgentEconomy
```

---

**Congratulations! Your demo is now validated on Base Sepolia testnet.** 🎉

All functionality working with real blockchain transactions. Ready for submission!
