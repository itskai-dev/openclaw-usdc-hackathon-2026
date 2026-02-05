# Architecture Documentation

## System Overview

This document describes the technical architecture of the agent-to-agent USDC payment system built for the OpenClaw USDC Hackathon 2026.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Agent Ecosystem                         │
│                                                              │
│  ┌─────────────┐                      ┌─────────────┐      │
│  │  Agent A    │                      │  Agent B    │      │
│  │ (Requester) │◀────────────────────▶│ (Performer) │      │
│  │             │   x402 Protocol      │             │      │
│  └──────┬──────┘                      └──────┬──────┘      │
│         │                                    │              │
│         │                                    │              │
│         ▼                                    ▼              │
│  ┌─────────────────────────────────────────────────┐       │
│  │           @x402 SDK Layer                        │       │
│  │  ┌──────────────┐         ┌──────────────┐      │       │
│  │  │ @x402/fetch  │         │ @x402/express│      │       │
│  │  │ (client)     │         │ (server)     │      │       │
│  │  └──────────────┘         └──────────────┘      │       │
│  └─────────────────────────────────────────────────┘       │
│         │                                    │              │
└─────────┼────────────────────────────────────┼──────────────┘
          │                                    │
          ▼                                    ▼
┌─────────────────────────────────────────────────────────────┐
│                  Blockchain Layer                           │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Base Sepolia Testnet                     │  │
│  │                                                        │  │
│  │  ┌────────────┐          ┌──────────────┐           │  │
│  │  │   USDC     │          │   Viem       │           │  │
│  │  │  Contract  │◀─────────│   Client     │           │  │
│  │  └────────────┘          └──────────────┘           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Details

### Agent A (Requester)

**Purpose:** Consumer of services, initiates payments

**Key Functions:**
- Service discovery via `/info` endpoint
- Payment-protected API requests
- Automatic x402 payment flow handling
- Transaction monitoring

**Technology Stack:**
- TypeScript
- `@x402/fetch` - Automatic payment client
- `@x402/evm` - EVM payment scheme
- `viem` - Ethereum wallet operations

**Key Code:**
```typescript
// Create payment-enabled fetch client
const fetchWithPayment = wrapFetchWithPaymentFromConfig(fetch, {
  schemes: [
    {
      network: 'eip155:84532', // Base Sepolia
      client: new ExactEvmScheme(account),
    },
  ],
});

// Make payment-protected request (automatic payment handling)
const response = await fetchWithPayment(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(params),
});
```

---

### Agent B (Performer)

**Purpose:** Service provider, receives payments

**Key Functions:**
- Service registration with payment requirements
- x402 middleware for endpoint protection
- On-chain payment verification
- Task execution after payment confirmation

**Technology Stack:**
- TypeScript
- Express.js web server
- `@x402/express` - Payment middleware
- `@x402/core` - x402 resource server
- `@x402/evm` - EVM payment verification

**Key Code:**
```typescript
// Initialize x402 resource server
const resourceServer = new x402ResourceServer(facilitatorClient)
  .register('eip155:*', new ExactEvmScheme());

// Define payment-protected routes
const routes = {
  'POST /task/fetch': {
    accepts: {
      scheme: 'exact',
      network: 'eip155:84532',
      payTo: recipientAddress,
      price: '$0.01',
      asset: 'USDC',
    },
  },
};

// Create HTTP server wrapper
const httpServer = new x402HTTPResourceServer(resourceServer, routes);

// Verify payment in endpoint
const verification = await httpServer.verifyAndSettlePayment(
  route,
  url,
  paymentSignature
);
```

---

## Payment Flow Sequence

### Step-by-Step Process

```
1. DISCOVERY PHASE
   Agent A                                Agent B
      │                                      │
      │─────GET /info────────────────────────▶│
      │                                      │
      │◀─────Service list + prices───────────│
      │                                      │

2. REQUEST PHASE (First Attempt)
   Agent A                                Agent B
      │                                      │
      │─────POST /task/fetch─────────────────▶│
      │     (no payment proof)               │
      │                                      │
      │◀─────402 Payment Required────────────│
      │     PAYMENT-REQUIRED header          │
      │     {                                │
      │       "payTo": "0x...",             │
      │       "amount": "10000",  // 0.01 USDC (6 decimals)
      │       "asset": "USDC",              │
      │       "network": "eip155:84532"     │
      │     }                                │
      │                                      │

3. PAYMENT PHASE
   Agent A                           Base Sepolia Blockchain
      │                                      │
      │──────Transfer USDC───────────────────▶│
      │      from: 0xAgentA                  │
      │      to: 0xAgentB                    │
      │      amount: 10000 (0.01 USDC)       │
      │                                      │
      │◀─────Transaction Receipt─────────────│
      │      txHash: 0x...                   │
      │                                      │

4. RETRY PHASE (With Payment Proof)
   Agent A                                Agent B
      │                                      │
      │─────POST /task/fetch─────────────────▶│
      │     PAYMENT-SIGNATURE header         │
      │     (blockchain tx proof)            │
      │                                      │
      │                                Agent B → Blockchain
      │                                      │────Verify tx──▶│
      │                                      │◀────Valid──────│
      │                                      │
      │                                 [Execute Task]
      │                                      │
      │◀─────200 OK + Result─────────────────│
      │     {                                │
      │       "success": true,               │
      │       "result": {...}                │
      │     }                                │
      │                                      │
```

---

## x402 Protocol Details

### HTTP 402 Status Code

The x402 protocol extends the HTTP 402 "Payment Required" status code (originally reserved but never standardized).

**Standard HTTP Flow:**
```
Client → Server: GET /resource
Server → Client: 200 OK + resource (if free)
              OR 401 Unauthorized (if auth required)
```

**x402 Payment Flow:**
```
Client → Server: GET /resource
Server → Client: 402 Payment Required + payment details
Client → Blockchain: Transfer payment
Client → Server: GET /resource + payment proof
Server → Blockchain: Verify payment
Server → Client: 200 OK + resource
```

### Payment Required Response

When a client requests a paid resource without payment, the server returns:

```http
HTTP/1.1 402 Payment Required
PAYMENT-REQUIRED: base64(JSON)
Content-Type: application/json

{
  "error": "Payment required",
  "message": "This endpoint requires a payment of $0.01 USDC"
}
```

The `PAYMENT-REQUIRED` header contains base64-encoded JSON:
```json
{
  "scheme": "exact",
  "network": "eip155:84532",
  "payTo": "0xRecipientAddress",
  "price": "$0.01",
  "asset": "USDC",
  "assetAddress": "0xUSDCContractAddress"
}
```

### Payment Proof

After making the blockchain payment, the client retries the request with proof:

```http
POST /task/fetch HTTP/1.1
PAYMENT-SIGNATURE: 0xTransactionHash
Content-Type: application/json

{...request body...}
```

The server verifies the transaction on-chain and, if valid, processes the request.

---

## Blockchain Integration

### Base Sepolia Network

**Why Base Sepolia:**
- Fast block times (~2 seconds)
- Low gas fees (~$0.001 per transaction)
- USDC native support
- Coinbase-backed infrastructure
- Well-maintained testnet faucets

**Network Details:**
- Chain ID: 84532 (EIP-155 format: `eip155:84532`)
- RPC: https://sepolia.base.org
- Block Explorer: https://sepolia.basescan.org
- Faucet: https://www.base.org/faucet

### USDC Token

**USDC on Base Sepolia:**
- Token standard: ERC-20
- Decimals: 6 (amounts in micro-dollars)
- Example: 0.01 USDC = 10000 units
- Faucet: https://faucet.circle.com/

**Transfer Operation:**
```typescript
// Using viem
const hash = await walletClient.writeContract({
  address: USDC_CONTRACT_ADDRESS,
  abi: ERC20_ABI,
  functionName: 'transfer',
  args: [recipientAddress, amountInMicroUSDC],
});
```

---

## Security Considerations

### Payment Verification

**Server-side checks:**
1. ✅ Transaction exists on blockchain
2. ✅ Transaction is confirmed (not pending)
3. ✅ Recipient address matches server's address
4. ✅ Amount matches or exceeds required payment
5. ✅ Token is USDC (correct contract address)
6. ✅ Transaction hasn't been used before (replay protection)

**Implementation:**
```typescript
const verification = await httpServer.verifyAndSettlePayment(
  route,
  url,
  paymentSignature
);

if (!verification.isValid) {
  return res.status(403).json({ error: 'Invalid payment' });
}
```

### Private Key Management

**Best Practices:**
- ⚠️ Never commit private keys to git
- ✅ Use environment variables (`.env` file)
- ✅ Use hardware wallets for production
- ✅ Separate wallets for testnet vs mainnet
- ✅ Monitor wallet balances and transactions

**Testnet vs Production:**
```
Testnet:  Low risk, can use hot wallets in .env
Mainnet:  High risk, use hardware wallets or MPC
```

---

## Performance Characteristics

### Latency

| Operation | Time | Notes |
|-----------|------|-------|
| Service discovery | ~50ms | HTTP round trip |
| Initial 402 response | ~100ms | Server processing + HTTP |
| USDC transfer | ~2-5s | Base Sepolia block time |
| Payment verification | ~500ms | RPC call + verification |
| Task execution | varies | Depends on service |
| **Total (first request)** | **~3-6s** | Dominated by blockchain |
| **Total (cached)** | **~150ms** | If payment pre-verified |

### Throughput

**Agent B capacity:**
- Requests/second: ~100 (Express.js limit)
- Payments/second: ~5-10 (blockchain bottleneck)
- Bottleneck: RPC calls for payment verification

**Optimization strategies:**
- Cache verified transactions (avoid re-checking)
- Batch verification for multiple payments
- Use WebSocket RPC for faster queries
- Pre-fund wallets to avoid funding delays

---

## Error Handling

### Common Error Cases

| Error | HTTP Code | Cause | Resolution |
|-------|-----------|-------|------------|
| No payment | 402 | First request | Make payment, retry |
| Invalid payment | 403 | Wrong amount/token | Check payment details |
| Insufficient funds | 402 | Wallet balance low | Fund wallet |
| Transaction failed | 500 | Blockchain error | Retry transaction |
| Service error | 500 | Task execution failed | Check task parameters |

### Retry Logic

**Client-side (automatic):**
```typescript
try {
  const response = await fetchWithPayment(url, options);
  // x402 SDK handles 402 automatically:
  // 1. Detect 402 response
  // 2. Parse payment requirements
  // 3. Execute payment
  // 4. Retry request with proof
} catch (error) {
  // Only throws if payment fails or service error
  console.error('Payment or service error:', error);
}
```

---

## Deployment

### Local Development

**Prerequisites:**
- Node.js 18+
- TypeScript
- Two funded testnet wallets

**Start Agent B:**
```bash
npm run agent-b
# Runs on http://localhost:3001
```

**Run Agent A:**
```bash
npm run agent-a -- demo
```

### Production Deployment

**Agent B (Service Provider):**
- Deploy to cloud (AWS, GCP, Vercel, Railway)
- Use environment variables for keys
- Enable HTTPS (required for production)
- Monitor transaction logs
- Set up alerting for payment failures

**Agent A (Requester):**
- Can run anywhere (local, cloud, serverless)
- Requires reliable RPC connection
- Monitor wallet balance
- Log all transactions for accounting

---

## Monitoring & Observability

### Key Metrics

**Agent B (Provider):**
- Requests received (total, by endpoint)
- Payments received (count, volume in USDC)
- Payment verification time
- Task execution time
- Error rate (by type)

**Agent A (Requester):**
- Services discovered
- Payments sent (count, volume)
- Payment success rate
- Average response time
- Task success rate

### Logging

**Transaction logs should include:**
```json
{
  "timestamp": "2026-02-08T12:00:00Z",
  "agent": "Agent Beta",
  "service": "data-fetch",
  "payment": {
    "from": "0xAgentA",
    "to": "0xAgentB",
    "amount": "0.01 USDC",
    "txHash": "0x...",
    "blockNumber": 12345678
  },
  "request": {
    "url": "https://api.example.com/data",
    "method": "POST"
  },
  "response": {
    "status": 200,
    "executionTime": 1234
  }
}
```

---

## Future Architecture Enhancements

### Phase 2: Smart Contract Escrow

```
Agent A                    Escrow Contract               Agent B
   │                              │                          │
   │──Lock USDC in escrow────────▶│                          │
   │                              │                          │
   │──Request task────────────────┼─────────────────────────▶│
   │                              │                          │
   │◀─────Task result─────────────┼──────────────────────────│
   │                              │                          │
   │──Approve release─────────────▶│                          │
   │                              │──Release USDC───────────▶│
   │                              │                          │
```

**Benefits:**
- Trustless (no need to trust counterparty)
- Automatic dispute resolution
- Refunds for failed tasks

### Phase 3: Service Discovery Protocol

```
┌──────────────────────────────────────┐
│     Service Registry (On-chain)      │
│                                      │
│  Agent B registers service           │
│  Agent A discovers via query         │
│  Reputation scores stored            │
└──────────────────────────────────────┘
```

**Benefits:**
- Decentralized service marketplace
- No single point of failure
- Built-in reputation system

---

## Conclusion

This architecture demonstrates a practical implementation of agent-to-agent economic transactions using:

✅ HTTP-based payment protocol (x402)  
✅ Blockchain payment settlement (Base Sepolia)  
✅ Stablecoin payments (USDC)  
✅ Automatic payment flow handling  
✅ Secure payment verification  

The system is **production-ready for testnet** and can be extended to mainnet with minimal changes.

---

**Document Version:** 1.0  
**Last Updated:** February 2026  
**Hackathon:** OpenClaw USDC Hackathon 2026
