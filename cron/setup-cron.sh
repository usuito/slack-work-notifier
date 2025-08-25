#!/bin/bash

# Slack Work CLI - Crontab Setup Script
# This script helps you setup automatic work start/end notifications

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CRON_DIR="$PROJECT_DIR/cron"
CRONTAB_FILE="$CRON_DIR/crontab"

echo "🔧 Slack Work CLI - Crontab Setup"
echo "================================="
echo ""

# Check if crontab file exists
if [ ! -f "$CRONTAB_FILE" ]; then
    echo "❌ Error: crontab file not found at $CRONTAB_FILE"
    exit 1
fi

# Make sure project is built
echo "📦 Building project..."
cd "$PROJECT_DIR"
npm run build >/dev/null 2>&1

echo ""
echo "📝 Schedule:"
echo "- Work start: Monday-Friday at 9:00 AM JST"
echo "- Work end:   Monday-Friday at 6:00 PM JST"
echo ""

# Ask for confirmation
read -p "Do you want to install this crontab? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Backup current crontab
    crontab -l 2>/dev/null > "$CRON_DIR/crontab.backup" || echo "# No previous crontab" > "$CRON_DIR/crontab.backup"
    
    # Create temporary file with new crontab
    temp_crontab=$(mktemp)
    
    # Add existing crontab entries (if any) plus new ones
    (crontab -l 2>/dev/null || true; echo ""; grep "^[0-9]" "$CRONTAB_FILE") > "$temp_crontab"
    
    # Install new crontab
    crontab "$temp_crontab"
    rm "$temp_crontab"
    
    echo ""
    echo "✅ Crontab installed successfully!"
else
    echo "❌ Installation cancelled."
fi

echo ""
echo "🎉 Setup complete!"
