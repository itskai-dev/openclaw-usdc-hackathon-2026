# Testnet Wallets for Validation

**Generated:** February 5, 2026  
**Purpose:** USDC Hackathon Phase 2 Validation  

---

## 🔐 Wallet Credentials

### Agent A (Requester - Payer)
- **Address:** `0x36dF5D06BF6fcF370BA07eB600427f790986999E`
- **Private Key:** `0xefdc42229f93e31d6373696cf2cb1d68932ceb2fe142ffbb22698587e9c51c24`
- **Role:** Initiates requests and pays for services
- **Needs:** 
  - 0.01 ETH (for gas)
  - 1.0 USDC (for service payments)

### Agent B (Performer - Receiver)
- **Address:** `0xC379Bf86Cd7B79A5C8c98E8E05fe06498C5b18Ed`
- **Private Key:** `0x7ecf6739bf0669ff18c056873b49093fc2b3d53de9ba28bafc49aa16a2d1055b`
- **Role:** Provides services and receives payments
- **Needs:** 
  - 0.01 ETH (for gas)
  - No USDC (will receive from Agent A)

---

## 💰 Funding Instructions

### Step 1: Fund with Base Sepolia ETH

**Base Faucet:** https://www.base.org/faucet

1. Visit the faucet
2. Connect wallet or paste address
3. Request 0.1 ETH for each address
4. Wait ~30 seconds for confirmation

**Fund these addresses:**
- `0x36dF5D06BF6fcF370BA07eB600427f790986999E` (Agent A)
- `0xC379Bf86Cd7B79A5C8c98E8E05fe06498C5b18Ed` (Agent B)

**Verify on BaseScan:**
- Agent A: https://sepolia.basescan.org/address/0x36dF5D06BF6fcF370BA07eB600427f790986999E
- Agent B: https://sepolia.basescan.org/address/0xC379Bf86Cd7B79A5C8c98E8E05fe06498C5b18Ed

---

### Step 2: Fund Agent A with Base Sepolia USDC

**Circle Faucet:** https://faucet.circle.com/

1. Visit the faucet
2. Select "Base Sepolia" network
3. Paste Agent A address: `0x36dF5D06BF6fcF370BA07eB600427f790986999E`
4. Click "Get USDC"
5. Wait ~30 seconds for confirmation

**USDC Contract:** `0x036CbD53842c5426634e7929541eC2318f3dCF7e`

**Verify USDC balance:**
```bash
cast call 0x036CbD53842c5426634e7929541eC2318f3dCF7e \
  "balanceOf(address)(uint256)" \
  0x36dF5D06BF6fcF370BA07eB600427f790986999E \
  --rpc-url https://sepolia.base.org
```

---

## ✅ Pre-Flight Checklist

Before running tests, verify:

- [ ] Agent A has ETH balance > 0.005 ETH
- [ ] Agent B has ETH balance > 0.005 ETH
- [ ] Agent A has USDC balance > 0.5 USDC
- [ ] `.env` file is configured with private keys
- [ ] RPC endpoint is responding: `curl https://sepolia.base.org`

---

## 🧪 Running Tests

Once wallets are funded:

### Terminal 1: Start Agent B
```bash
cd projects/usdc-hackathon-submission
npm run agent-b
```

Expected output:
```
╔════════════════════════════════════════════════╗
║  Agent Beta - Service Provider Agent           ║
╚════════════════════════════════════════════════╝

💰 Payment recipient: 0xC379Bf86Cd7B79A5C8c98E8E05fe06498C5b18Ed
✓ x402 resource server initialized
✓ Server listening on http://localhost:3001
```

### Terminal 2: Test Agent A

**Test 1: Data Fetch ($0.01 USDC)**
```bash
npm run agent-a -- fetch https://api.coinbase.com/v2/exchange-rates?currency=ETH
```

**Test 2: Computation ($0.05 USDC)**
```bash
npm run agent-a -- compute sum 100,200,300,400,500
```

**Test 3: Content Generation ($0.10 USDC)**
```bash
npm run agent-a -- generate "a futuristic AI agent marketplace"
```

---

## 📊 Expected Results

### Success Indicators

Each test should show:

1. **Agent A output:**
   ```
   ✓ Wallet initialized: 0x36dF...
   ✓ Network: Base Sepolia (testnet)
   💰 Wallet ready for transactions
   
   🔍 Discovering services from Agent B...
   ✓ Found agent: Agent Beta
   ✓ Services available: 3
   
   📤 Requesting task: fetch
   💳 Payment required - processing...
   ✓ Payment sent: 0x[TX_HASH]
   ✓ Task completed successfully
   ```

2. **Agent B output:**
   ```
   📥 Received fetch request...
   ✓ Payment verified from: {...}
   ✓ Payment settled successfully
   Fetching: https://api.coinbase.com/...
   ✓ Task completed successfully
   ```

3. **On-chain verification:**
   - Transaction appears on BaseScan
   - USDC transfer from Agent A to Agent B
   - Status: Success

---

## 🔍 Troubleshooting

### Error: "Insufficient funds"
- Check ETH balance for gas
- Check USDC balance in Agent A wallet

### Error: "Payment verification failed"
- Verify RPC URL is correct: `https://sepolia.base.org`
- Check that x402 facilitator is reachable
- Ensure wallets are on Base Sepolia (chain ID 84532)

### Error: "Connection refused"
- Ensure Agent B is running first
- Check port 3001 is not in use: `lsof -i :3001`

---

## 📝 Documentation Checklist

After successful tests, document:

- [ ] All 3 transaction hashes
- [ ] Screenshots of terminal output (both agents)
- [ ] BaseScan links showing transfers
- [ ] Final USDC balances (Agent A spent, Agent B received)
- [ ] Total test duration

**Save results to:** `TESTNET-RESULTS.md`

---

## 🎯 Success Criteria

Tests are complete when:

- ✅ All 3 services execute successfully
- ✅ All payments are verified on-chain
- ✅ Agent B receives correct USDC amounts
- ✅ No error messages in either agent
- ✅ All transactions confirmed on BaseScan

**Total expected cost:** ~$0.16 USDC + gas fees (~$0.01 ETH)

---

## 🚨 Security Note

**These are testnet wallets for demonstration purposes only.**

- Private keys are included here for hackathon validation
- DO NOT send real mainnet funds to these addresses
- DO NOT reuse these keys for production
- Delete `.env` file after testing if keys are exposed

---

**Status:** ⏳ Wallets generated, awaiting funding  
**Next Step:** Fund wallets from faucets, then run tests  
**ETA:** 15-20 minutes (5 min funding + 10-15 min testing)
