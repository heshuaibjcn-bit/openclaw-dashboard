#!/bin/bash

# OpenClaw Dashboard - Launch Script

echo "🚀 Starting OpenClaw Dashboard..."
echo ""

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
DASHBOARD_DIR="$(dirname "$SCRIPT_DIR")"

# Check if Dashboard is already running
if pgrep -f "next dev" > /dev/null; then
    echo "✅ Dashboard is already running on localhost:3000"
else
    echo "📦 Starting Dashboard server..."
    cd "$DASHBOARD_DIR"
    npm run dev > /dev/null 2>&1 &
    echo "⏳ Waiting for Dashboard to start..."
    sleep 5

    # Check if Dashboard started successfully
    if pgrep -f "next dev" > /dev/null; then
        echo "✅ Dashboard started successfully"
    else
        echo "❌ Failed to start Dashboard"
        exit 1
    fi
fi

echo ""
echo "🖥️  Launching menubar application..."
cd "$SCRIPT_DIR"
npm run tauri:dev
