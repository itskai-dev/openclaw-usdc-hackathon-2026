# Demo Video Script
**OpenClaw USDC Hackathon 2026 Submission**  
**Duration:** 2-3 minutes  
**Format:** Screen recording + voiceover/captions

---

## Pre-Recording Checklist

- [ ] Terminal setup: Clean, large font (14-16pt)
- [ ] Browser tabs ready: BaseScan, GitHub repo
- [ ] Both agents ready to run
- [ ] Wallets funded with Base Sepolia ETH + USDC
- [ ] Screen recording software configured (OBS/QuickTime/ScreenFlow)
- [ ] Microphone tested (if doing voiceover)

---

## Video Structure

### [0:00-0:15] Opening (15 seconds)

**Visual:** Title slide or terminal with project name

**Script:**
> "Hi, I'm [Name] from Reflectt Labs. We built a demonstration of autonomous AI agents conducting economic transactions using USDC on Base Sepolia. Let me show you how two agents can hire and pay each other for services without any human intervention."

**On-screen text:**
```
Agent-to-Agent USDC Payments
OpenClaw USDC Hackathon 2026
Powered by x402 Protocol + Base + USDC
```

---

### [0:15-0:45] Architecture Overview (30 seconds)

**Visual:** Show architecture diagram

**Script:**
> "The system has two agents: Agent A is the requester who needs services, and Agent B is the performer who provides them. Agent B offers three types of services: data fetching for 1 cent, computation for 5 cents, and content generation for 10 cents."
>
> "When Agent A wants a service, it uses the x402 payment protocol. The server responds with '402 Payment Required', Agent A automatically pays in USDC on Base Sepolia, then retries the request with proof of payment. The server verifies the blockchain transaction and delivers the service. All of this happens automatically."

**On-screen annotations:**
- Highlight Agent A → Agent B flow
- Point out "402 Payment Required" step
- Show blockchain verification
- Emphasize "automatic" nature

---

### [0:45-1:00] Setup Demo (15 seconds)

**Visual:** Terminal - show configuration

**Script:**
> "Let me show this in action. I have two wallets configured with testnet USDC, and I'm running Agent B, which is the service provider."

**Commands to show:**
```bash
# Show wallet addresses (blur private keys!)
cat .env | grep ADDRESS

# Start Agent B
npm run agent-b
```

**Expected output:**
```
╔════════════════════════════════════════════════╗
║  Agent Beta - Service Provider Agent           ║
╚════════════════════════════════════════════════╝

💰 Payment recipient: 0x...
✓ Agent Beta is running on http://localhost:3001

Available services:
  POST /task/fetch      - Data fetch service ($0.01 USDC)
  POST /task/compute    - Computation service ($0.05 USDC)
  POST /task/generate   - Content generation ($0.10 USDC)
```

---

### [1:00-1:45] Live Demo (45 seconds)

**Visual:** Terminal - run Agent A demo

**Script:**
> "Now I'll run Agent A, which will request all three services. Watch for the automatic payment flow."

**Commands:**
```bash
# In new terminal
npm run agent-a -- demo
```

**What to highlight in the output:**

1. **Service Discovery** (~5 sec)
```
🔍 Discovering services from Agent B...
✓ Found 3 services: fetch, compute, generate
```

2. **First Payment - Data Fetch** (~10 sec)
```
📤 Requesting data fetch service...
⚠️  402 Payment Required: 0.01 USDC
💸 Sending payment to 0x...
✅ Payment confirmed: 0xabc123... (BaseScan link)
🔄 Retrying request with payment proof...
✅ Service complete! Result: {...}
```

3. **Second Payment - Computation** (~10 sec)
```
📤 Requesting computation service...
⚠️  402 Payment Required: 0.05 USDC
💸 Sending payment...
✅ Payment confirmed: 0xdef456...
✅ Service complete! Sum: 1500
```

4. **Third Payment - Content Generation** (~10 sec)
```
📤 Requesting content generation...
⚠️  402 Payment Required: 0.10 USDC
💸 Sending payment...
✅ Payment confirmed: 0xghi789...
✅ Service complete! Generated 250 words
```

5. **Summary** (~10 sec)
```
╔════════════════════════════════════════════════╗
║  Demo Complete!                                 ║
╠════════════════════════════════════════════════╣
║  Services Used: 3                               ║
║  Total Paid: $0.16 USDC                         ║
║  Gas Fees: ~$0.006                              ║
║  Transactions: 3                                ║
╚════════════════════════════════════════════════╝
```

**Narration during this section:**
> "Notice how Agent A automatically handles the entire payment flow. For each service, it receives a 402 response, pays the exact amount in USDC, waits for blockchain confirmation, then retries with proof. The whole process takes just a few seconds per transaction. This is the x402 protocol in action."

---

### [1:45-2:15] Blockchain Verification (30 seconds)

**Visual:** Browser - BaseScan explorer

**Script:**
> "Let's verify these payments on the blockchain. Here on BaseScan, you can see the three USDC transfers from Agent A to Agent B. Each transaction is confirmed on Base Sepolia, showing the exact amounts: one cent, five cents, and ten cents."

**Actions:**
1. Open BaseScan link from terminal output
2. Show transaction details:
   - From: Agent A address
   - To: Agent B address
   - Value: 0.01 USDC (show in USDC, not wei)
   - Status: Success ✓
3. Briefly show second transaction
4. Briefly show third transaction

**On-screen annotation:**
- Highlight "Success" status
- Circle the USDC amounts
- Point out "Base Sepolia Testnet" indicator

---

### [2:15-2:45] Use Cases & Vision (30 seconds)

**Visual:** Split screen - code on left, bullet points on right

**Script:**
> "This opens up incredible possibilities for agent economies. Imagine agents that can hire specialized services from other agents: data analysis, API calls, content creation, or complex computations. No platform fees, no middlemen—just direct peer-to-peer payments using USDC stablecoin."
>
> "The code is open source and production-ready. You can run it yourself, build new services, or integrate it into your own agent frameworks."

**On-screen text:**
```
Real-World Use Cases:
✓ Agent marketplaces
✓ Multi-agent workflows
✓ Decentralized API economy
✓ Agent collaboration networks

Built with:
• x402 Protocol (Coinbase)
• Base Sepolia L2
• Circle USDC
• TypeScript + Node.js
```

---

### [2:45-3:00] Closing (15 seconds)

**Visual:** GitHub repo page

**Script:**
> "Check out the full code, documentation, and setup guide on GitHub. Thank you to Circle, Coinbase, and OpenClaw for making this hackathon possible. The future of AI is agents hiring agents—and we just built the payment infrastructure to make it happen."

**On-screen text:**
```
github.com/reflectt/openclaw-usdc-hackathon-2026

OpenClaw USDC Hackathon 2026
Built by Reflectt Labs (AI Agent Team)

@reflectt_labs
```

**Fade to black with:**
```
Built with ❤️ by AI agents, for AI agents
```

---

## Technical Recording Notes

### Terminal Setup
```bash
# Increase font size
# Use a clean theme (e.g., "Solarized Dark" or "Tomorrow Night")
# Set dimensions: 100 columns x 30 rows
# Clear scrollback before recording
clear && printf '\e[3J'
```

### Recording Settings
- **Resolution:** 1920x1080 (Full HD) minimum
- **Frame rate:** 30 fps minimum, 60 fps preferred
- **Format:** MP4 (H.264 codec)
- **Audio:** AAC, 128kbps minimum (if voiceover)
- **File size:** Under 500MB for YouTube upload

### Post-Production
1. **Trim** any dead air or mistakes
2. **Add captions** if no voiceover (use YouTube auto-captions)
3. **Speed up** terminal output if too slow (1.25x - 1.5x)
4. **Add highlights** (colored boxes/arrows) for key points
5. **Background music** (optional, very subtle)

### YouTube Upload Checklist
- [ ] Descriptive title: "Agent-to-Agent USDC Payments Demo | OpenClaw Hackathon 2026"
- [ ] Tags: x402, USDC, Base, agent-payments, web3, AI agents, OpenClaw
- [ ] Description with links to repo and hackathon
- [ ] Thumbnail with clear text (architecture diagram or title card)
- [ ] Visibility: Public (after hackathon submission) or Unlisted (for judging)

---

## Alternative: Automated Captions (No Voiceover)

If you prefer to skip voiceover, you can use on-screen captions:

**Style:**
- Position: Top or bottom
- Font: Clear sans-serif (Arial, Helvetica)
- Size: Large enough to read at 720p
- Background: Semi-transparent black box
- Duration: 3-5 seconds per caption

**Caption timing:**
- Sync with actions on screen
- Keep them concise (max 2 lines)
- Use emojis for visual interest (🚀 💰 ✅)

**Example caption sequence:**
```
[0:00] 🤖 Two AI agents can now hire & pay each other
[0:05] 💰 Using real USDC on Base Sepolia blockchain
[0:10] ⚡ Powered by x402 payment protocol
[0:15] 📊 Let's see it in action...
```

---

## Troubleshooting

### If demo fails during recording:
- **Insufficient funds:** Ensure wallets have enough testnet USDC + ETH for gas
- **Network issues:** Use backup RPC URL or record offline with mock data
- **Slow confirmations:** Speed up video in post-production or use fast network

### Backup plan:
Record each component separately:
1. Architecture explanation (slides)
2. Agent B startup
3. Agent A demo (can run multiple times, pick best take)
4. BaseScan verification (can show pre-recorded transactions)

Edit together in post-production.

---

## Resources

### Screen Recording Tools
- **macOS:** QuickTime (free), ScreenFlow (paid)
- **Windows:** OBS Studio (free), Camtasia (paid)
- **Linux:** OBS Studio (free), SimpleScreenRecorder (free)

### Video Editing
- **Free:** DaVinci Resolve, iMovie (macOS), Kdenlive (Linux)
- **Paid:** Final Cut Pro (macOS), Adobe Premiere

### Captions
- YouTube auto-captions (review and edit)
- Rev.com (professional, $1.50/min)
- Descript (auto-transcribe and edit)

---

**Good luck with the recording! 🎬**
