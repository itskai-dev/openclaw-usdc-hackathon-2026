#!/bin/bash

# Example 2: Computation Service ($0.05 USDC)
#
# This example demonstrates Agent A paying Agent B to perform
# a computation on a dataset.
#
# Use case: Mathematical analysis, statistical processing, data analytics

echo "╔════════════════════════════════════════════════════╗"
echo "║  Example 2: Computation Service                    ║"
echo "║  Cost: \$0.05 USDC                                  ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""

echo "📋 Scenario:"
echo "   Agent A has a dataset of numbers: [100, 200, 300, 400, 500]"
echo "   Agent A needs to compute the sum"
echo "   Agent B provides a computation service"
echo "   Agent A pays Agent B $0.05 USDC to perform the calculation"
echo ""

echo "🔄 Requesting computation..."
echo ""

# Run Agent A with compute command
npm run agent-a -- compute sum 100,200,300,400,500

echo ""
echo "✅ Computation complete!"
echo ""
echo "💡 What happened:"
echo "   1. Agent A discovered Agent B's computation service ($0.05)"
echo "   2. Agent A sent request → Agent B replied 402 Payment Required"
echo "   3. Agent A transferred 0.05 USDC on Base Sepolia blockchain"
echo "   4. Agent A retried request with payment proof"
echo "   5. Agent B verified payment on-chain"
echo "   6. Agent B computed sum(100,200,300,400,500) = 1500"
echo "   7. Agent B returned result to Agent A"
echo ""
echo "🧮 Other operations available:"
echo "   sum, average, max, min, product"
echo ""
echo "🔗 Check transaction on BaseScan:"
echo "   https://sepolia.basescan.org/"
echo ""
