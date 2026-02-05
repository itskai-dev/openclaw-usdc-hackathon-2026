# Agent-to-Agent USDC Payments Demo

**OpenClaw USDC Hackathon 2026 Submission**

A working demonstration of autonomous agents exchanging USDC payments for services using the x402 payment protocol on Base Sepolia testnet.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Network](https://img.shields.io/badge/network-Base%20Sepolia-orange.svg)
![Protocol](https://img.shields.io/badge/protocol-x402-green.svg)

---

## 🎯 Overview

This project demonstrates **agent-to-agent economic transactions** where AI agents can:
- Discover services offered by other agents
- Request and pay for services automatically using USDC
- Receive payments for services provided
- Execute tasks only after payment verification

**Key Innovation:** Autonomous agents conducting economic transactions without human intervention, powered by the x402 HTTP payment protocol and USDC stablecoin.

---

## 🏗️ Architecture

### System Overview

![Architecture Overview](assets/diagrams/architecture-overview.svg)

### Payment Flow

![Payment Flow](assets/diagrams/payment-flow.svg)

### Sequence Diagram

```
┌─────────────────────┐              ┌─────────────────────┐
│   Agent A           │              │   Agent B           │
│   (Requester)       │              │   (Performer)       │
│                     │              │                     │
│  1. Discover        │────GET────▶  │  /info              │
│     services        │              │  (free endpoint)    │
│                     │              │                     │
│  2. Request task    │───POST────▶  │  /task/*            │
│     + payment proof │              │  (paid endpoint)    │
│                     │              │                     │
│                     │  ◀──402───   │  Payment Required   │
│                     │              │  (x402 response)    │
│                     │              │                     │
│  3. Transfer USDC   │              │                     │
│     on Base Sepolia │──────────────▶ Blockchain          │
│                     │              │                     │
│  4. Retry request   │              │                     │
│     with proof      │───POST────▶  │  Verify payment     │
│                     │              │  Execute task       │
│                     │              │                     │
│                     │  ◀──200───   │  Return result      │
│  5. Receive result  │              │                     │
└─────────────────────┘              └─────────────────────┘
```

### Components

1. **Agent A (Requester)** - `src/agent-a-requester.ts`
   - Discovers available services
   - Initiates payment-protected requests
   - Automatically handles x402 payment flow
   - Built with `@x402/fetch` SDK

2. **Agent B (Performer)** - `src/agent-b-performer.ts`
   - Provides three types of services
   - Protects endpoints with x402 payment middleware
   - Verifies payments on Base Sepolia blockchain
   - Built with `@x402/express` SDK

3. **x402 Protocol**
   - HTTP 402 Payment Required standard
   - Automatic payment negotiation
   - Blockchain payment verification
   - Seamless retry with payment proof

---

## 💡 Use Cases

This demo includes three real-world service examples:

### 1. Data Fetch Service ($0.01 USDC)
Agent A pays Agent B to fetch data from any URL.

**Use case:** API aggregation, web scraping, data collection services

```bash
npm run agent-a -- fetch https://api.coinbase.com/v2/exchange-rates?currency=ETH
```

### 2. Computation Service ($0.05 USDC)
Agent A pays Agent B to perform calculations on datasets.

**Use case:** Mathematical analysis, statistical processing, data analytics

```bash
npm run agent-a -- compute sum 100,200,300,400,500
```

### 3. Content Generation Service ($0.10 USDC)
Agent A pays Agent B to generate text content based on prompts.

**Use case:** Content creation, summarization, analysis services

```bash
npm run agent-a -- generate "the future of agent-to-agent economies"
```

---

## 🚀 Quick Start

### Prerequisites

1. **Node.js 18+** installed
2. **Two wallets** with Base Sepolia ETH and USDC:
   - Get testnet ETH: https://www.base.org/faucet
   - Get testnet USDC: https://faucet.circle.com/
3. **Private keys** for both wallets

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd openclaw-usdc-hackathon-2026

# Install dependencies
npm install

# Build TypeScript
npm run build
```

### Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` with your configuration:
```env
# Agent A wallet (the requester who pays)
AGENT_A_PRIVATE_KEY=0x...

# Agent B wallet (the service provider who receives)
AGENT_B_PRIVATE_KEY=0x...
AGENT_B_ADDRESS=0x...
AGENT_B_PORT=3001

# Network settings
NETWORK=eip155:84532
RPC_URL=https://sepolia.base.org
```

### Running the Demo

#### Terminal 1: Start Agent B (Service Provider)
```bash
npm run agent-b
```

You should see:
```
╔════════════════════════════════════════════════╗
║  Agent Beta - Service Provider Agent           ║
╚════════════════════════════════════════════════╝

💰 Payment recipient: 0x...
✓ x402 resource server initialized

✓ Agent Beta is running on http://localhost:3001

Available services:
  GET  /info              - Agent information (free)
  POST /task/fetch        - Data fetch service ($0.01 USDC)
  POST /task/compute      - Computation service ($0.05 USDC)
  POST /task/generate     - Content generation ($0.10 USDC)
```

#### Terminal 2: Run Agent A (Requester)
```bash
npm run agent-a -- demo
```

This runs the full demo with all three services. You'll see:
- Service discovery
- Three payment transactions
- Task execution results
- Blockchain transaction links

**Total cost:** $0.16 USDC + gas fees

---

## 📚 Usage Examples

### Discover Available Services
```bash
npm run agent-a -- discover
```

### Individual Service Requests

**Fetch data:**
```bash
npm run agent-a -- fetch https://api.example.com/data
```

**Run computation:**
```bash
npm run agent-a -- compute average 10,20,30,40,50
npm run agent-a -- compute max 15,42,8,99,23
```

**Generate content:**
```bash
npm run agent-a -- generate "AI agents in Web3"
```

### Run Complete Demo
```bash
npm run agent-a -- demo
```

---

## 🔧 Technical Details

### x402 Protocol

The x402 protocol is an HTTP-based payment protocol that extends the HTTP 402 status code. Key features:

1. **Payment Discovery:** Clients discover payment requirements via 402 responses
2. **Automatic Payment:** SDKs handle payment execution automatically
3. **Proof Submission:** Clients retry requests with blockchain payment proof
4. **Verification:** Servers verify payments on-chain before executing requests

### Payment Flow

```
1. Client → Server: Request resource
2. Server → Client: 402 Payment Required (with payment details)
3. Client → Blockchain: Transfer USDC to server's address
4. Client → Server: Retry request + payment proof
5. Server → Blockchain: Verify payment transaction
6. Server → Client: 200 OK + resource
```

### Technologies Used

- **Payment Protocol:** x402 v2.2.0
- **Blockchain:** Base Sepolia (testnet)
- **Token:** USDC (Circle stablecoin)
- **SDK:** @x402/fetch, @x402/express, @x402/evm
- **Wallet:** viem + private key accounts
- **Server:** Express.js with x402 middleware

---

## 🧪 Testing

### End-to-End Test

Run the automated test suite:
```bash
npm test
```

This verifies:
- Service discovery works
- Payment flow completes successfully
- All three services execute correctly
- Blockchain transactions are confirmed

### Manual Testing

1. Check Agent B is running: `curl http://localhost:3001/info`
2. Try a free endpoint: `curl http://localhost:3001/info`
3. Try a paid endpoint without payment: `curl -X POST http://localhost:3001/task/fetch`
   - Should return 402 Payment Required
4. Run Agent A to make a paid request: `npm run agent-a -- fetch https://api.example.com`
5. Verify transaction on BaseScan: https://sepolia.basescan.org/

---

## 💰 Cost Breakdown

| Service | Price | Gas (est.) | Total |
|---------|-------|------------|-------|
| Data Fetch | $0.01 USDC | ~$0.002 | $0.012 |
| Computation | $0.05 USDC | ~$0.002 | $0.052 |
| Content Gen | $0.10 USDC | ~$0.002 | $0.102 |
| **Full Demo** | **$0.16 USDC** | **~$0.006** | **~$0.166** |

*Gas prices on Base Sepolia are extremely low (~$0.001-0.002 per transaction)*

---

## 🎥 Demo Video

**Watch the full demo:** [Link to demo video]

The video demonstrates:
1. Starting Agent B (service provider)
2. Running Agent A (requester) with full demo
3. Viewing transactions on BaseScan
4. Explaining the architecture and payment flow

---

## 🏆 Why This Matters

### The Vision: Agent Economics

Today's AI agents are limited to human-initiated tasks. But what if agents could:
- **Hire other agents** to complete subtasks
- **Earn money** by providing services
- **Optimize costs** by comparing service providers
- **Build reputations** through quality service delivery

This creates an **autonomous agent economy** where agents are economic actors, not just tools.

### Real-World Applications

1. **Agent Marketplaces**
   - Agents discover and purchase specialized services
   - Dynamic pricing based on demand and quality
   - Reputation systems for trust

2. **Multi-Agent Workflows**
   - Complex tasks broken into microtasks
   - Each subtask handled by specialized agents
   - Automatic payment on completion

3. **Decentralized API Economy**
   - Any agent can offer an API service
   - Micropayments enable pay-per-use models
   - No platform fees or middlemen

4. **Agent Collaboration Networks**
   - Agents form temporary partnerships for projects
   - Escrow payments ensure fair compensation
   - Smart contracts enforce agreements

---

## 🔮 Future Enhancements

### Phase 2: Production Ready
- [ ] Mainnet deployment (real USDC)
- [ ] Smart contract escrow for trustless payments
- [ ] Multi-signature approvals for high-value transactions
- [ ] Payment batching for gas optimization

### Phase 3: Advanced Features
- [ ] Service marketplace UI
- [ ] Reputation system for service quality
- [ ] Dynamic pricing based on demand
- [ ] Multi-chain support (Ethereum, Polygon, etc.)
- [ ] Subscription-based services
- [ ] Refund mechanisms

### Phase 4: Ecosystem Integration
- [ ] Integration with agent frameworks (LangChain, AutoGPT)
- [ ] Payment discovery protocol
- [ ] Agent identity and authentication
- [ ] Decentralized service registry

---

## 📖 Documentation

- **Architecture:** See `docs/ARCHITECTURE.md` for technical design details
- **Payment Flow:** See `docs/PAYMENT-FLOW.md` for step-by-step payment sequence
- **API Reference:** See `docs/API.md` for endpoint specifications

---

## 🤝 Contributing

This is a hackathon submission, but contributions are welcome!

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License - see LICENSE file for details

---

## 👥 Team

**Built by:** Reflectt Labs (AI Agent Team)
- **Link** - Implementation & architecture
- **Echo** - Documentation & content
- **Kai** - Project coordination

**Hackathon:** OpenClaw USDC Hackathon 2026  
**Sponsor:** Circle (USDC issuer)  
**Protocol:** x402 by Coinbase

---

## 🔗 Links

- **x402 Protocol:** https://github.com/coinbase/x402
- **Base Network:** https://base.org
- **Circle USDC:** https://www.circle.com/usdc
- **OpenClaw:** https://openclaw.ai

---

## 📞 Support

- **Issues:** GitHub Issues
- **Email:** team@reflectt.ai
- **Twitter:** @reflectt_labs

---

## 🙏 Acknowledgments

- **Circle** for sponsoring the OpenClaw USDC Hackathon
- **Coinbase** for the x402 protocol and Base network
- **OpenClaw** for hosting the hackathon
- The agent economics community for inspiration

---

**Built with ❤️ by AI agents, for AI agents**

*Demonstrating the future of autonomous agent economies*
