# Quick Wallet Funding Guide

## Addresses to Fund

**Agent A (Requester - PRIORITY):**
```
0x36dF5D06BF6fcF370BA07eB600427f790986999E
```
Needs: 0.01+ ETH + 1+ USDC

**Agent B (Performer):**
```
0xC379Bf86Cd7B79A5C8c98E8E05fe06498C5b18Ed
```
Needs: 0.01+ ETH

---

## Funding Steps

### Step 1: Get Base Sepolia ETH (Both Wallets)

**Option A: Base Official Faucet** (RECOMMENDED)
- URL: https://www.base.org/faucet
- Requires: GitHub or Coinbase sign-in
- Amount: 0.1 ETH per request
- Limit: Once per 24 hours
- Steps:
  1. Visit faucet
  2. Sign in with GitHub
  3. Paste Agent A address, submit
  4. Wait ~30 seconds
  5. Repeat for Agent B address

**Option B: Coinbase Wallet**
- If you have Coinbase Wallet, it may give free testnet ETH
- Switch to Base Sepolia network
- Look for "Get testnet ETH" button

**Option C: Bridge from Ethereum Sepolia**
1. Get ETH on Ethereum Sepolia first: https://sepoliafaucet.com/
2. Bridge to Base Sepolia: https://bridge.base.org/

---

### Step 2: Get Base Sepolia USDC (Agent A Only)

**Circle USDC Faucet:**
- URL: https://faucet.circle.com/
- Amount: 10 USDC per request
- Limit: Once per 24 hours
- Steps:
  1. Visit faucet
  2. Select "Base Sepolia" from network dropdown
  3. Paste Agent A address: `0x36dF5D06BF6fcF370BA07eB600427f790986999E`
  4. Click "Get USDC"
  5. Wait ~30 seconds for confirmation

**USDC Contract Address (for verification):**
```
0x036CbD53842c5426634e7929541eC2318f3dCF7e
```

---

## Verification

### Check ETH Balances
Visit BaseScan for each address:
- Agent A: https://sepolia.basescan.org/address/0x36dF5D06BF6fcF370BA07eB600427f790986999E
- Agent B: https://sepolia.basescan.org/address/0xC379Bf86Cd7B79A5C8c98E8E05fe06498C5b18Ed

Or use CLI:
```bash
cd projects/usdc-hackathon-submission
node -e "
const { createPublicClient, http, formatEther } = require('viem');
const { baseSepolia } = require('viem/chains');

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http('https://sepolia.base.org')
});

async function check() {
  const ethA = await publicClient.getBalance({ 
    address: '0x36dF5D06BF6fcF370BA07eB600427f790986999E' 
  });
  const ethB = await publicClient.getBalance({ 
    address: '0xC379Bf86Cd7B79A5C8c98E8E05fe06498C5b18Ed' 
  });
  console.log('Agent A ETH:', formatEther(ethA));
  console.log('Agent B ETH:', formatEther(ethB));
}
check();
"
```

### Check USDC Balance (Agent A)
```bash
node -e "
const { createPublicClient, http, formatUnits } = require('viem');
const { baseSepolia } = require('viem/chains');

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http('https://sepolia.base.org')
});

const USDC = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';

async function check() {
  const balance = await publicClient.readContract({
    address: USDC,
    abi: [{
      name: 'balanceOf',
      type: 'function',
      stateMutability: 'view',
      inputs: [{ type: 'address' }],
      outputs: [{ type: 'uint256' }]
    }],
    functionName: 'balanceOf',
    args: ['0x36dF5D06BF6fcF370BA07eB600427f790986999E']
  });
  console.log('Agent A USDC:', formatUnits(balance, 6));
}
check();
"
```

---

## Ready to Test?

Once both wallets have ETH and Agent A has USDC, run:

```bash
# Terminal 1: Start Agent B
npm run agent-b

# Terminal 2: Run demo
npm run agent-a -- demo
```

You should see 3 successful USDC payment transactions!

---

## Troubleshooting

**Faucet says "Rate limited":**
- Try again in 24 hours
- Or use a different faucet option above

**Transaction stuck "pending":**
- Base Sepolia might be slow (1-2 min wait)
- Check BaseScan for transaction status

**"Insufficient funds" error:**
- Verify balance with verification scripts above
- Make sure you're using Base Sepolia (not Ethereum Sepolia)

**USDC not showing up:**
- Double-check you selected "Base Sepolia" (not Ethereum Sepolia)
- Wait 1-2 minutes and refresh BaseScan
- USDC appears under "Tokens" tab, not main balance

---

**Quick Links:**
- Base Faucet: https://www.base.org/faucet
- USDC Faucet: https://faucet.circle.com/
- BaseScan: https://sepolia.basescan.org/
