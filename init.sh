#!/bin/bash

# OpenClaw Dashboard Development Environment Initialization Script
# This script sets up the development environment for the OpenClaw Dashboard project

set -e  # Exit on error

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "🦞 OpenClaw Dashboard - Development Environment Setup"
echo "======================================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Function to install dependencies if needed
install_deps() {
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing dependencies..."
        npm install
    fi
}

# Function to start the development server
start_dev() {
    echo ""
    echo "🚀 Starting development server..."
    echo "   Dashboard will be available at: http://localhost:3000"
    echo "   OpenClaw Gateway should be at: http://127.0.0.1:18789"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""

    # Check if OpenClaw gateway is running
    if command -v openclaw &> /dev/null; then
        echo "🔍 Checking OpenClaw Gateway status..."
        if openclaw health &> /dev/null; then
            echo "✅ OpenClaw Gateway is running"
        else
            echo "⚠️  OpenClaw Gateway is not running. Start it with: openclaw gateway"
        fi
    else
        echo "⚠️  OpenClaw CLI not found in PATH"
    fi

    echo ""
    npm run dev
}

# Function to run tests
run_tests() {
    echo ""
    echo "🧪 Running tests..."
    npm test
}

# Function to build for production
build_prod() {
    echo ""
    echo "🏗️  Building for production..."
    npm run build
}

# Main script logic
case "${1:-start}" in
    start)
        install_deps
        start_dev
        ;;
    test)
        install_deps
        run_tests
        ;;
    build)
        install_deps
        build_prod
        ;;
    install)
        echo "📦 Installing dependencies..."
        npm install
        ;;
    clean)
        echo "🧹 Cleaning node_modules and build artifacts..."
        rm -rf node_modules .next
        echo "✅ Clean complete"
        ;;
    *)
        echo "Usage: $0 {start|test|build|install|clean}"
        echo ""
        echo "Commands:"
        echo "  start   - Install dependencies and start dev server (default)"
        echo "  test    - Run tests"
        echo "  build   - Build for production"
        echo "  install - Install dependencies only"
        echo "  clean   - Remove node_modules and build artifacts"
        exit 1
        ;;
esac
