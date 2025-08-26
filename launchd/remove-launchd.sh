#!/bin/bash

# Slack Work Notifier - launchd Removal Script
# This script removes launchd agents for work notifications

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

echo -e "${BLUE}🗑️  Removing launchd agents for Slack Work Notifier...${NC}"
echo

LAUNCH_AGENTS_DIR="$HOME/Library/LaunchAgents"
START_PLIST="com.usuito.slack-work-notifier.start.plist"
END_PLIST="com.usuito.slack-work-notifier.end.plist"

# Function to safely unload and remove plist
remove_agent() {
    local plist_name="$1"
    local plist_path="$LAUNCH_AGENTS_DIR/$plist_name"
    
    if [ -f "$plist_path" ]; then
        print_info "Removing $plist_name..."
        
        # Try to unload the agent
        if launchctl unload "$plist_path" 2>/dev/null; then
            print_status "Unloaded $plist_name"
        else
            print_warning "Agent $plist_name was not loaded or already stopped"
        fi
        
        # Remove the plist file
        rm "$plist_path"
        print_status "Removed $plist_path"
    else
        print_warning "$plist_name not found, skipping"
    fi
}

# Check if any agents are currently loaded
print_info "Checking for currently loaded agents..."
LOADED_AGENTS=$(launchctl list | grep "slack-work-notifier" || true)

if [ -n "$LOADED_AGENTS" ]; then
    print_info "Found loaded agents:"
    echo "$LOADED_AGENTS"
    echo
else
    print_info "No slack-work-notifier agents currently loaded"
fi

# Remove both agents
remove_agent "$START_PLIST"
remove_agent "$END_PLIST"

# Double-check by trying to unload by label (in case files are missing but agents are loaded)
print_info "Ensuring all agents are properly unloaded..."
launchctl unload -w "$LAUNCH_AGENTS_DIR/$START_PLIST" 2>/dev/null || true
launchctl unload -w "$LAUNCH_AGENTS_DIR/$END_PLIST" 2>/dev/null || true

# Alternative method: unload by label
launchctl remove "com.usuito.slack-work-notifier.start" 2>/dev/null || true
launchctl remove "com.usuito.slack-work-notifier.end" 2>/dev/null || true

echo
echo -e "${GREEN}🎉 Removal completed successfully!${NC}"
echo
print_info "All launchd agents have been removed and unloaded."
print_info "Your scheduled work notifications are no longer active."
echo
print_info "To verify complete removal, run:"
print_info "launchctl list | grep slack-work-notifier"
print_info "(should return nothing)"
echo
print_info "To also check for any remaining plist files:"
print_info "ls -la ~/Library/LaunchAgents/com.usuito.slack-work-notifier*"
print_info "(should show 'No such file or directory')"
echo
print_info "Note: Log files in the logs/ directory were preserved."
print_info "You can manually delete them if desired:"
print_info "rm -rf logs/"
echo
print_warning "If you want to switch back to cron, don't forget to set up your crontab again!"
