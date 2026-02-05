#!/bin/bash

# Example 1: Data Fetch Service ($0.01 USDC)
# 
# This example demonstrates Agent A paying Agent B to fetch data
# from an external API.
#
# Use case: API aggregation, web scraping, data collection services

echo "╔════════════════════════════════════════════════════╗"
echo "║  Example 1: Data Fetch Service                     ║"
echo "║  Cost: \$0.01 USDC                                  ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""

echo "📋 Scenario:"
echo "   Agent A needs cryptocurrency exchange rate data"
echo "   Agent B provides a data fetching service"
echo "   Agent A pays Agent B $0.01 USDC to fetch the data"
echo ""

echo "🔄 Requesting data fetch..."
echo ""

# Run Agent A with fetch command
npm run agent-a -- fetch "https://api.coinbase.com/v2/exchange-rates?currency=ETH"

echo ""
echo "✅ Data fetch complete!"
echo ""
echo "💡 What happened:"
echo "   1. Agent A discovered Agent B's data fetch service ($0.01)"
echo "   2. Agent A sent request → Agent B replied 402 Payment Required"
echo "   3. Agent A transferred 0.01 USDC on Base Sepolia blockchain"
echo "   4. Agent A retried request with payment proof"
echo "   5. Agent B verified payment on-chain"
echo "   6. Agent B fetched data and returned result"
echo ""
echo "🔗 Check transaction on BaseScan:"
echo "   https://sepolia.basescan.org/"
echo ""
