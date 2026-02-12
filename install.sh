#!/bin/sh
# Install agentation global command
# Creates ~/.local/bin/agentation wrapper

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BIN_DIR="$HOME/.local/bin"
WRAPPER="$BIN_DIR/agentation"

echo "Installing agentation command..."

mkdir -p "$BIN_DIR"

cat > "$WRAPPER" <<EOF
#!/bin/sh
exec "$SCRIPT_DIR/start"
EOF
chmod +x "$WRAPPER"

echo "Installed: $WRAPPER"

# Check PATH
case ":$PATH:" in
  *":$BIN_DIR:"*)
    echo ""
    echo "Usage: agentation"
    ;;
  *)
    echo ""
    echo "Warning: $BIN_DIR is not in PATH"
    echo "Add to your shell config (~/.zshrc, ~/.bashrc):"
    echo ""
    echo "  export PATH=\"\$HOME/.local/bin:\$PATH\""
    echo ""
    echo "Then restart your terminal and run: agentation"
    ;;
esac
