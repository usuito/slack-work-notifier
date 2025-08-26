#!/bin/bash

# Slack Work Notifier - launchd Setup Script
# This script sets up launchd agents for automatic work notifications

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

echo -e "${BLUE}🚀 Setting up launchd agents for Slack Work Notifier...${NC}"
echo

# Get current directory (project root)
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LAUNCHD_DIR="$PROJECT_DIR/launchd"
LAUNCH_AGENTS_DIR="$HOME/Library/LaunchAgents"
LOGS_DIR="$PROJECT_DIR/logs"

print_info "Project directory: $PROJECT_DIR"
print_info "Launch agents directory: $LAUNCH_AGENTS_DIR"
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed or not in PATH"
    print_error "Please install Node.js and try again"
    exit 1
fi

# Get Node.js path
NODE_PATH=$(which node)
print_status "Node.js found at: $NODE_PATH"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed or not in PATH"
    exit 1
fi

print_status "npm found"

# Create Launch Agents directory if it doesn't exist
if [ ! -d "$LAUNCH_AGENTS_DIR" ]; then
    mkdir -p "$LAUNCH_AGENTS_DIR"
    print_status "Created Launch Agents directory"
fi

# Create logs directory if it doesn't exist
if [ ! -d "$LOGS_DIR" ]; then
    mkdir -p "$LOGS_DIR"
    print_status "Created logs directory"
fi

# Build the TypeScript project
print_info "Building TypeScript project..."
cd "$PROJECT_DIR"
npm run build
print_status "Project built successfully"

# Function to update plist file with actual paths
update_plist_file() {
    local template_file="$1"
    local output_file="$2"
    
    sed "s|PROJECT_PATH|$PROJECT_DIR|g; s|/usr/local/bin/node|$NODE_PATH|g" "$template_file" > "$output_file"
}

# Copy and update plist files
START_PLIST="com.usuito.slack-work-notifier.start.plist"
END_PLIST="com.usuito.slack-work-notifier.end.plist"

print_info "Installing launchd agents..."

# Update and copy start plist
update_plist_file "$LAUNCHD_DIR/$START_PLIST" "$LAUNCH_AGENTS_DIR/$START_PLIST"
print_status "Installed $START_PLIST"

# Update and copy end plist
update_plist_file "$LAUNCHD_DIR/$END_PLIST" "$LAUNCH_AGENTS_DIR/$END_PLIST"
print_status "Installed $END_PLIST"

# Unload existing agents (if any) to avoid conflicts
print_info "Unloading existing agents (if any)..."
launchctl unload "$LAUNCH_AGENTS_DIR/$START_PLIST" 2>/dev/null || true
launchctl unload "$LAUNCH_AGENTS_DIR/$END_PLIST" 2>/dev/null || true

# Load the launchd agents
print_info "Loading launchd agents..."
launchctl load "$LAUNCH_AGENTS_DIR/$START_PLIST"
launchctl load "$LAUNCH_AGENTS_DIR/$END_PLIST"

print_status "Successfully loaded both launchd agents"

echo
echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
echo
print_info "The following schedules are now active:"
print_info "• Work start notification: Monday-Friday at 9:00 AM"
print_info "• Work end notification: Monday-Friday at 6:00 PM"
echo
print_info "Unlike cron, these launchd agents will:"
print_info "• Run even after your Mac wakes up from sleep"
print_info "• Be more reliable with macOS power management"
print_info "• Automatically restart if they fail"
echo
print_info "Log files will be created in: $LOGS_DIR"
print_info "• Start notifications: $LOGS_DIR/start.log"
print_info "• End notifications: $LOGS_DIR/end.log"
print_info "• Errors: $LOGS_DIR/start.error.log and $LOGS_DIR/end.error.log"
echo
print_info "To check the status of your agents, run:"
print_info "launchctl list | grep slack-work-notifier"
echo
print_info "To test manually, run:"
print_info "cd $PROJECT_DIR && npm run start start"
print_info "cd $PROJECT_DIR && npm run start end"
echo
print_warning "Remember to check that your .env file is properly configured!"
