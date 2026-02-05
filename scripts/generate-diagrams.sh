#!/bin/bash
# Generate SVG diagrams from Mermaid source files

set -e

echo "╔════════════════════════════════════════════════╗"
echo "║  Generating Architecture Diagrams              ║"
echo "╚════════════════════════════════════════════════╝"
echo ""

# Check if mermaid-cli is installed
if ! command -v mmdc &> /dev/null; then
    echo "❌ mermaid-cli not found. Installing..."
    npm install -g @mermaid-js/mermaid-cli
fi

DIAGRAMS_DIR="assets/diagrams"
cd "$(dirname "$0")/.."

echo "📊 Generating diagrams..."

# Generate payment flow diagram
if [ -f "$DIAGRAMS_DIR/payment-flow.mmd" ]; then
    echo "  → Payment Flow Sequence..."
    mmdc -i "$DIAGRAMS_DIR/payment-flow.mmd" \
         -o "$DIAGRAMS_DIR/payment-flow.svg" \
         -t neutral \
         -b transparent
    echo "    ✓ payment-flow.svg"
fi

# Generate architecture overview
if [ -f "$DIAGRAMS_DIR/architecture-overview.mmd" ]; then
    echo "  → Architecture Overview..."
    mmdc -i "$DIAGRAMS_DIR/architecture-overview.mmd" \
         -o "$DIAGRAMS_DIR/architecture-overview.svg" \
         -t neutral \
         -b transparent
    echo "    ✓ architecture-overview.svg"
fi

echo ""
echo "✅ All diagrams generated successfully!"
echo ""
echo "📁 Output location: $DIAGRAMS_DIR/"
echo ""
echo "You can now add these to your README.md:"
echo ""
echo "![Payment Flow](assets/diagrams/payment-flow.svg)"
echo "![Architecture](assets/diagrams/architecture-overview.svg)"
echo ""
