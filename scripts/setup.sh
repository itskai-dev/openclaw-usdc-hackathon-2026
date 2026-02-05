#!/bin/bash

# Setup script for OpenClaw USDC Hackathon Submission
# This script helps you get started quickly

echo "╔════════════════════════════════════════════════════╗"
echo "║   OpenClaw USDC Hackathon Setup                    ║"
echo "║   Agent-to-Agent Payment Demo                      ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""

# Check Node.js version
echo "📦 Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please upgrade to Node.js 18+."
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo ""
echo "📥 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"

# Build TypeScript
echo ""
echo "🔨 Building TypeScript..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Failed to build TypeScript"
    exit 1
fi

echo "✅ TypeScript built successfully"

# Check for .env file
echo ""
echo "⚙️  Configuration..."
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Creating from template..."
    cp .env.example .env
    echo "✅ Created .env file"
    echo ""
    echo "⚠️  IMPORTANT: You must edit .env with your configuration!"
    echo ""
    echo "Required settings:"
    echo "  - AGENT_A_PRIVATE_KEY (your wallet private key for Agent A)"
    echo "  - AGENT_B_PRIVATE_KEY (your wallet private key for Agent B)"
    echo "  - AGENT_B_ADDRESS (Agent B's wallet address)"
    echo ""
    echo "Get testnet tokens:"
    echo "  - Base Sepolia ETH: https://www.base.org/faucet"
    echo "  - Base Sepolia USDC: https://faucet.circle.com/"
    echo ""
else
    echo "✅ .env file exists"
fi

# Check if .env is configured
if grep -q "0x\.\.\." .env 2>/dev/null; then
    echo "⚠️  .env file still has placeholder values"
    echo "    Please edit .env with your actual configuration"
fi

echo ""
echo "╔════════════════════════════════════════════════════╗"
echo "║   Setup Complete!                                  ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo ""
echo "1. Configure your .env file:"
echo "   nano .env"
echo ""
echo "2. Start Agent B (service provider):"
echo "   npm run agent-b"
echo ""
echo "3. In another terminal, run Agent A (demo):"
echo "   npm run agent-a -- demo"
echo ""
echo "Or run individual examples:"
echo "   npm run agent-a -- fetch <url>"
echo "   npm run agent-a -- compute sum 1,2,3,4,5"
echo "   npm run agent-a -- generate \"your prompt\""
echo ""
echo "📚 Documentation:"
echo "   README.md - Main documentation"
echo "   docs/ARCHITECTURE.md - Technical architecture"
echo "   docs/PAYMENT-FLOW.md - Payment flow details"
echo "   examples/README.md - Usage examples"
echo ""
