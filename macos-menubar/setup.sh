#!/bin/bash

# OpenClaw Menubar App - Quick Start Script

echo "🦀 OpenClaw Menubar App - Quick Start"
echo "======================================"
echo ""

# Check if Rust is installed
if ! command -v cargo &> /dev/null; then
    echo "❌ Rust not found. Installing Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
fi

# Check if Node.js is installed
if ! command -v npm &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Check if Dashboard project exists
if [ ! -d "/Users/alex/openclaw-dashboard" ]; then
    echo "⚠️  Warning: Dashboard project not found at /Users/alex/openclaw-dashboard"
    echo "   The app may not function correctly without the Dashboard project."
    echo ""
fi

# Install npm dependencies
echo "📦 Installing npm dependencies..."
npm install

echo ""
echo "🚀 Starting development server..."
echo "   The menubar app will open automatically"
echo ""
echo "What this app does:"
echo "  - Start/Stop OpenClaw Dashboard (Next.js dev server)"
echo "  - Show Dashboard running status"
echo "  - Quick access to Dashboard at localhost:3000"
echo ""
echo "To stop: Press Ctrl+C"
echo ""

# Start Tauri dev
npm run tauri:dev
