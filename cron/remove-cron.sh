#!/bin/bash

# Slack Work CLI - Crontab Removal Script
# This script helps you remove the automatic work start/end notifications

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CRON_DIR="$PROJECT_DIR/cron"

echo "🗑️  Slack Work CLI - Crontab Removal"
echo "===================================="
echo ""

# Show current crontab
echo "📅 Current crontab entries:"
echo "----------------------------"
current_crontab=$(crontab -l 2>/dev/null || echo "No crontab entries found.")
echo "$current_crontab"

# Check if our entries exist
if echo "$current_crontab" | grep -q "slack-work-cli"; then
    echo ""
    echo "🔍 Found Slack Work CLI entries in crontab."
    echo ""
    
    # Show which entries will be removed
    echo "📋 Entries to be removed:"
    echo "------------------------"
    echo "$current_crontab" | grep "slack-work-cli" || true
    
    echo ""
    read -p "Do you want to remove these cron jobs? (y/N): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Backup current crontab
        echo "💾 Backing up current crontab to cron/crontab.backup..."
        crontab -l > "$CRON_DIR/crontab.backup" 2>/dev/null || echo "# No previous crontab" > "$CRON_DIR/crontab.backup"
        
        # Create new crontab without slack-work-cli entries
        temp_crontab=$(mktemp)
        crontab -l 2>/dev/null | grep -v "slack-work-cli" > "$temp_crontab" || true
        
        # Install new crontab
        if [ -s "$temp_crontab" ]; then
            crontab "$temp_crontab"
            echo "✅ Slack Work CLI cron jobs removed successfully!"
        else
            crontab -r
            echo "✅ All cron jobs removed (crontab was empty after removal)!"
        fi
        
        rm "$temp_crontab"
        
        echo ""
        echo "📊 Remaining crontab entries:"
        crontab -l 2>/dev/null || echo "No crontab entries remaining."
        
        # Clean up log files
        echo ""
        read -p "Do you also want to remove log files? (y/N): " -n 1 -r
        echo ""
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            rm -f /tmp/slack-work-cli-start.log
            rm -f /tmp/slack-work-cli-end.log
            echo "🗑️  Log files removed."
        fi
        
    else
        echo "❌ Removal cancelled."
    fi
else
    echo ""
    echo "ℹ️  No Slack Work CLI entries found in crontab."
fi

echo ""
echo "🎉 Removal process complete!"
