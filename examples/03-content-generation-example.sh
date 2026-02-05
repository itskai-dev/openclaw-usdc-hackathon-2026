#!/bin/bash

# Example 3: Content Generation Service ($0.10 USDC)
#
# This example demonstrates Agent A paying Agent B to generate
# text content based on a prompt.
#
# Use case: Content creation, summarization, analysis services

echo "╔════════════════════════════════════════════════════╗"
echo "║  Example 3: Content Generation Service             ║"
echo "║  Cost: \$0.10 USDC                                  ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""

echo "📋 Scenario:"
echo "   Agent A needs a description of 'the future of AI agents'"
echo "   Agent B provides a content generation service"
echo "   Agent A pays Agent B $0.10 USDC to generate content"
echo ""

echo "🔄 Requesting content generation..."
echo ""

# Run Agent A with generate command
npm run agent-a -- generate "the future of agent-to-agent economies"

echo ""
echo "✅ Content generation complete!"
echo ""
echo "💡 What happened:"
echo "   1. Agent A discovered Agent B's content generation service ($0.10)"
echo "   2. Agent A sent request → Agent B replied 402 Payment Required"
echo "   3. Agent A transferred 0.10 USDC on Base Sepolia blockchain"
echo "   4. Agent A retried request with payment proof"
echo "   5. Agent B verified payment on-chain"
echo "   6. Agent B generated content based on prompt"
echo "   7. Agent B returned generated text to Agent A"
echo ""
echo "✍️  Content types available:"
echo "   description, summary, analysis"
echo ""
echo "🔗 Check transaction on BaseScan:"
echo "   https://sepolia.basescan.org/"
echo ""
