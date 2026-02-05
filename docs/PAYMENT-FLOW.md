# Payment Flow Documentation

This document provides a detailed, step-by-step walkthrough of how the x402 payment flow works in our agent-to-agent system.

---

## Overview

The payment flow consists of **4 main phases:**

1. **Discovery** - Agent A learns what services Agent B offers
2. **Payment Negotiation** - Agent B tells Agent A how much to pay
3. **Payment Execution** - Agent A transfers USDC on blockchain
4. **Service Delivery** - Agent B verifies payment and delivers service

---

## Phase 1: Service Discovery

**Goal:** Agent A discovers available services and their prices

### HTTP Request
```http
GET /info HTTP/1.1
Host: localhost:3001
Accept: application/json
```

### HTTP Response
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "agent": "Agent Beta",
  "type": "service-provider",
  "services": [
    {
      "path": "/task/fetch",
      "price": "$0.01 USDC",
      "description": "Fetch data from any URL"
    },
    {
      "path": "/task/compute",
      "price": "$0.05 USDC",
      "description": "Perform calculations"
    },
    {
      "path": "/task/generate",
      "price": "$0.10 USDC",
      "description": "Generate text content"
    }
  ],
  "network": "eip155:84532",
  "paymentMethod": "x402 protocol"
}
```

### Code Implementation (Agent A)
```typescript
const response = await fetch(`${agentBUrl}/info`);
const info = await response.json();

console.log(`Available services: ${info.services.length}`);
info.services.forEach(service => {
  console.log(`- ${service.description} (${service.price})`);
});
```

**Result:** Agent A now knows:
- What services are available
- How much each service costs
- What payment method to use
- What blockchain network to use

---

## Phase 2: Payment Negotiation (First Request)

**Goal:** Agent A requests a service, Agent B responds with payment requirements

### HTTP Request (Agent A → Agent B)
```http
POST /task/fetch HTTP/1.1
Host: localhost:3001
Content-Type: application/json

{
  "url": "https://api.coinbase.com/v2/exchange-rates?currency=ETH"
}
```

**Note:** No payment proof included yet!

### HTTP Response (Agent B → Agent A)
```http
HTTP/1.1 402 Payment Required
PAYMENT-REQUIRED: eyJzY2hlbWUiOiJleGFjdCIsIm5ldHdvcmsiOiJlaXAxNTU6ODQ1MzIi...
Content-Type: application/json

{
  "error": "Payment required",
  "message": "This service requires payment. Please include PAYMENT-SIGNATURE header."
}
```

### Decoded `PAYMENT-REQUIRED` Header
```json
{
  "scheme": "exact",
  "network": "eip155:84532",
  "payTo": "0xAgentB_Address",
  "price": "$0.01",
  "asset": "USDC",
  "assetAddress": "0xUSDC_Contract_Address",
  "chainId": 84532,
  "amount": "10000"
}
```

**Key fields:**
- `payTo` - Agent B's wallet address (payment recipient)
- `amount` - Payment amount in token's smallest unit (10000 = 0.01 USDC, 6 decimals)
- `asset` - Token symbol (USDC)
- `assetAddress` - USDC contract address on Base Sepolia
- `network` - Blockchain network (eip155:84532 = Base Sepolia)

### Code Implementation (Agent B)
```typescript
// Check for payment signature
const paymentSignature = req.header('PAYMENT-SIGNATURE');

if (!paymentSignature) {
  // No payment - return 402 with requirements
  const paymentRequired = httpServer.createPaymentRequiredResponse(
    'POST /task/fetch',
    req.url
  );
  
  const encoded = Buffer.from(JSON.stringify(paymentRequired)).toString('base64');
  
  res.status(402)
    .header('PAYMENT-REQUIRED', encoded)
    .json({
      error: 'Payment required',
      message: 'This service requires payment of $0.01 USDC',
    });
  return;
}
```

**Result:** Agent A now knows:
- Exactly how much to pay (10000 units = 0.01 USDC)
- Where to send payment (Agent B's address)
- What token to use (USDC contract address)
- What blockchain to use (Base Sepolia, chain ID 84532)

---

## Phase 3: Payment Execution

**Goal:** Agent A transfers USDC to Agent B on Base Sepolia blockchain

### Step 3.1: Agent A Constructs Transaction

```typescript
// Using viem wallet client
const account = privateKeyToAccount(process.env.AGENT_A_PRIVATE_KEY);
const walletClient = createWalletClient({
  account,
  chain: baseSepolia,
  transport: http(),
});

// USDC transfer parameters
const USDC_ADDRESS = '0x...'; // USDC contract on Base Sepolia
const RECIPIENT = '0x...';     // Agent B's address
const AMOUNT = 10000n;         // 0.01 USDC (6 decimals)

// Execute transfer
const txHash = await walletClient.writeContract({
  address: USDC_ADDRESS,
  abi: ERC20_ABI,
  functionName: 'transfer',
  args: [RECIPIENT, AMOUNT],
});
```

### Step 3.2: Transaction Broadcast to Blockchain

```
Agent A Wallet → Base Sepolia RPC Node → Base Sepolia Network
```

**Transaction details:**
```json
{
  "from": "0xAgentA_Address",
  "to": "0xUSDC_Contract",
  "data": "0xa9059cbb...",  // transfer(recipient, amount) encoded
  "value": "0",
  "gas": "50000",
  "maxFeePerGas": "1000000000",
  "maxPriorityFeePerGas": "1000000000"
}
```

### Step 3.3: Transaction Confirmation

**Block inclusion:**
- Base Sepolia block time: ~2 seconds
- Confirmations needed: 1 (for testnet)
- Total wait time: ~2-5 seconds

**Transaction receipt:**
```json
{
  "transactionHash": "0xabc123...",
  "blockNumber": 12345678,
  "status": "success",
  "from": "0xAgentA_Address",
  "to": "0xUSDC_Contract",
  "gasUsed": "45000",
  "effectiveGasPrice": "1000000000"
}
```

### Code Implementation (Agent A)
```typescript
// x402 SDK handles this automatically!
const fetchWithPayment = wrapFetchWithPaymentFromConfig(fetch, {
  schemes: [
    {
      network: 'eip155:84532',
      client: new ExactEvmScheme(account), // Handles payment execution
    },
  ],
});

// When 402 response detected, SDK:
// 1. Parses payment requirements
// 2. Constructs USDC transfer transaction
// 3. Signs and broadcasts transaction
// 4. Waits for confirmation
// 5. Retries original request with proof
```

**Result:**
- ✅ USDC transferred from Agent A to Agent B
- ✅ Transaction confirmed on Base Sepolia
- ✅ Agent A has transaction hash as payment proof

---

## Phase 4: Service Delivery (Retry with Proof)

**Goal:** Agent A retries request with payment proof, Agent B verifies and delivers service

### Step 4.1: HTTP Request with Proof (Agent A → Agent B)

```http
POST /task/fetch HTTP/1.1
Host: localhost:3001
Content-Type: application/json
PAYMENT-SIGNATURE: 0xabc123...  ← Transaction hash as proof

{
  "url": "https://api.coinbase.com/v2/exchange-rates?currency=ETH"
}
```

**Key difference:** Now includes `PAYMENT-SIGNATURE` header with transaction hash

### Step 4.2: Payment Verification (Agent B)

Agent B verifies the payment on-chain:

```typescript
const verificationResult = await httpServer.verifyAndSettlePayment(
  'POST /task/fetch',
  req.url,
  paymentSignature // Transaction hash
);

if (!verificationResult.isValid) {
  return res.status(403).json({ error: 'Invalid payment' });
}
```

**Verification checks:**
1. ✅ Transaction exists on blockchain
2. ✅ Transaction is confirmed (not pending)
3. ✅ Recipient is Agent B's address
4. ✅ Amount is at least 10000 (0.01 USDC)
5. ✅ Token is USDC (correct contract)
6. ✅ Transaction hasn't been used before (replay protection)

**Blockchain RPC call:**
```typescript
// Fetch transaction receipt from blockchain
const receipt = await publicClient.getTransactionReceipt({
  hash: paymentSignature,
});

// Parse transfer event from logs
const transferEvent = receipt.logs.find(log =>
  log.address === USDC_ADDRESS &&
  log.topics[0] === TRANSFER_EVENT_SIGNATURE
);

// Decode: Transfer(from, to, amount)
const { to, amount } = decodeEventLog({
  abi: ERC20_ABI,
  data: transferEvent.data,
  topics: transferEvent.topics,
});

// Verify
if (to !== AGENT_B_ADDRESS) throw new Error('Wrong recipient');
if (amount < REQUIRED_AMOUNT) throw new Error('Insufficient amount');
```

### Step 4.3: Task Execution (Agent B)

Once payment is verified, Agent B executes the requested task:

```typescript
// Payment confirmed - execute task
const result = await axios.get(req.body.url);

res.json({
  success: true,
  service: 'data-fetch',
  result: {
    url: req.body.url,
    status: result.status,
    data: result.data,
  },
  agent: 'Agent Beta',
  timestamp: new Date().toISOString(),
});
```

### Step 4.4: HTTP Response (Agent B → Agent A)

```http
HTTP/1.1 200 OK
Content-Type: application/json
PAYMENT-RESPONSE: eyJ0cmFuc2FjdGlvbiI6IjB4YWJjMTIzLi4uIn0=

{
  "success": true,
  "service": "data-fetch",
  "result": {
    "url": "https://api.coinbase.com/v2/exchange-rates?currency=ETH",
    "status": 200,
    "data": {
      "currency": "ETH",
      "rates": {
        "USD": "2500.00",
        "BTC": "0.045",
        ...
      }
    }
  },
  "agent": "Agent Beta",
  "timestamp": "2026-02-08T12:00:00Z"
}
```

**Decoded `PAYMENT-RESPONSE` Header:**
```json
{
  "transaction": "0xabc123...",
  "verified": true
}
```

**Result:**
- ✅ Payment verified on blockchain
- ✅ Task executed successfully
- ✅ Result returned to Agent A
- ✅ Transaction complete!

---

## Complete Flow Diagram

```
┌─────────┐                                                    ┌─────────┐
│ Agent A │                                                    │ Agent B │
└────┬────┘                                                    └────┬────┘
     │                                                              │
     │ 1. GET /info (discovery)                                    │
     │─────────────────────────────────────────────────────────────▶│
     │                                                              │
     │ Services list + prices                                      │
     │◀─────────────────────────────────────────────────────────────│
     │                                                              │
     │ 2. POST /task/fetch (no payment proof)                      │
     │─────────────────────────────────────────────────────────────▶│
     │                                                              │
     │ 402 Payment Required (payment details)                      │
     │◀─────────────────────────────────────────────────────────────│
     │                                                              │
     │                                                              │
     │ 3. Transfer USDC                         ┌──────────────┐   │
     │──────────────────────────────────────────▶│ Base Sepolia│   │
     │                                           │  Blockchain  │   │
     │ Transaction receipt                       └──────────────┘   │
     │◀──────────────────────────────────────────                   │
     │                                                              │
     │ 4. POST /task/fetch (with payment proof)                    │
     │─────────────────────────────────────────────────────────────▶│
     │                                                              │
     │                                           ┌──────────────┐   │
     │                                           │ Verify tx on │   │
     │                                           │  blockchain  │───▶│
     │                                           └──────────────┘   │
     │                                                 ✓            │
     │                                           [Execute Task]     │
     │                                                              │
     │ 200 OK + Result                                             │
     │◀─────────────────────────────────────────────────────────────│
     │                                                              │
     ▼                                                              ▼
```

---

## Timing Breakdown

| Step | Operation | Time |
|------|-----------|------|
| 1 | Discovery request | ~50ms |
| 2 | Initial request → 402 response | ~100ms |
| 3 | Payment transaction broadcast | ~200ms |
| 4 | Transaction confirmation (Base Sepolia) | ~2-5s |
| 5 | Retry request with proof | ~100ms |
| 6 | Payment verification (RPC call) | ~500ms |
| 7 | Task execution | varies |
| 8 | Response delivery | ~50ms |
| **Total (first request)** | **~3-6 seconds** |

**Note:** Subsequent requests can be faster if:
- Agent A caches service info (skip step 1)
- Agent B caches verified transactions (faster step 6)

---

## Error Scenarios

### Scenario 1: Insufficient Funds

```
Agent A → Agent B: POST /task/fetch
Agent B → Agent A: 402 Payment Required

Agent A → Blockchain: Transfer USDC
Blockchain → Agent A: ERROR - Insufficient balance

Agent A: Payment failed, cannot retry request
```

**Resolution:** Fund Agent A's wallet with USDC

### Scenario 2: Wrong Payment Amount

```
Agent A → Blockchain: Transfer 5000 (0.005 USDC) instead of 10000
Blockchain → Agent A: Success (txHash)

Agent A → Agent B: POST /task/fetch + txHash
Agent B → Blockchain: Verify transaction
Blockchain → Agent B: Amount = 5000 (< required 10000)

Agent B → Agent A: 403 Forbidden - Insufficient payment
```

**Resolution:** Make another payment for the remaining amount

### Scenario 3: Transaction Pending

```
Agent A → Blockchain: Transfer USDC
Agent A → Agent B: POST /task/fetch + txHash (transaction still pending!)

Agent B → Blockchain: Verify transaction
Blockchain → Agent B: Transaction pending (not confirmed)

Agent B → Agent A: 403 Forbidden - Payment not confirmed yet
```

**Resolution:** Wait for transaction confirmation, then retry

### Scenario 4: Replay Attack Prevention

```
Agent A → Agent B: POST /task/fetch + txHash
Agent B: Verify payment ✓, execute task, return result

[Later]
Agent A → Agent B: POST /task/compute + SAME txHash (trying to reuse)
Agent B: Check transaction history
Agent B: ERROR - Transaction already used!

Agent B → Agent A: 403 Forbidden - Payment already used
```

**Resolution:** Make a new payment for each request

---

## Best Practices

### For Service Providers (Agent B)

1. **Always verify payments on-chain** - Don't trust client claims
2. **Check transaction confirmation** - Wait for at least 1 confirmation
3. **Prevent replay attacks** - Track used transaction hashes
4. **Handle pending transactions gracefully** - Return clear error messages
5. **Log all transactions** - For accounting and debugging

### For Service Consumers (Agent A)

1. **Use the x402 SDK** - Handles payment flow automatically
2. **Monitor wallet balance** - Ensure sufficient funds before requesting
3. **Wait for confirmation** - Don't retry too quickly
4. **Handle 402 responses** - Be prepared to pay
5. **Track spending** - Log all payments for accounting

### Security

1. **Use HTTPS in production** - Prevent MITM attacks
2. **Validate payment amounts** - Check they match service prices
3. **Rate limit requests** - Prevent DOS attacks
4. **Monitor for fraud** - Detect unusual payment patterns
5. **Separate wallets** - Use different keys for testnet vs mainnet

---

## Conclusion

The x402 payment flow provides a **simple, secure, and automatic** way for agents to exchange services for payment. The key advantages are:

✅ **HTTP-native** - Works with existing HTTP infrastructure  
✅ **Automatic** - SDKs handle payment flow transparently  
✅ **Secure** - On-chain verification prevents fraud  
✅ **Flexible** - Works with any EVM chain and token  
✅ **Efficient** - Minimal latency overhead (~3-6s for first request)

---

**Document Version:** 1.0  
**Last Updated:** February 2026  
**Hackathon:** OpenClaw USDC Hackathon 2026
