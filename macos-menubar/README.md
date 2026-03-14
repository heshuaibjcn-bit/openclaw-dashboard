# OpenClaw Dashboard - Menu Bar Application

A macOS menu bar application for OpenClaw Dashboard - AI Agent Management Interface.

## Features

- Quick access to OpenClaw Dashboard from menu bar
- Real-time Dashboard status monitoring
- Opens Dashboard directly in the menu bar window (1200x800)
- Option to open Dashboard in browser
- Lightweight and always accessible

## Quick Start

### Method 1: Using the launch script (Recommended)

```bash
cd /Users/alex/openclaw-dashboard/macos-menubar
chmod +x start.sh
./start.sh
```

This will:
1. Start the Dashboard server (localhost:3000) if not running
2. Launch the menubar application

### Method 2: Manual startup

1. Start the Dashboard server:
```bash
cd /Users/alex/openclaw-dashboard
npm run dev
```

2. In a separate terminal, start the menubar app:
```bash
cd /Users/alex/openclaw-dashboard/macos-menubar
npm run tauri:dev
```

## Development

### Prerequisites

- Node.js 18+
- Rust 1.77+
- OpenClaw Dashboard project

### Build for Production

```bash
cd /Users/alex/openclaw-dashboard/macos-menubar
npm run tauri:build
```

The built `.app` file will be in:
```
src-tauri/target/release/bundle/dmg/OpenClaw Dashboard_0.1.0_x64.dmg
```

## How It Works

1. **Dashboard Server**: Runs Next.js dev server on localhost:3000
2. **Menubar App**: Native macOS application that provides quick access
3. **Integration**: Menubar window loads Dashboard directly

## Window Features

- Size: 1200x800 pixels (suitable for full Dashboard interface)
- Borderless (no title bar)
- Always on top
- Hidden from Dock
- Transparent background option

## Project Structure

```
macos-menubar/
├── src/                      # React frontend
│   ├── App.tsx              # Welcome screen with Dashboard links
│   ├── main.tsx             # React entry point
│   └── styles.css           # Global styles
├── src-tauri/               # Rust backend
│   ├── src/
│   │   ├── commands.rs      # Tauri commands
│   │   ├── services.rs      # Dashboard status monitoring
│   │   └── lib.rs           # Main entry point
│   ├── capabilities/        # Tauri permissions
│   └── tauri.conf.json      # Menubar configuration
├── package.json             # Node dependencies
├── start.sh                 # Launch script
└── README.md                # This file
```

## Usage

1. **Click the menu bar icon** - Shows the Dashboard welcome screen
2. **Open Dashboard** - Click to load full Dashboard interface
3. **Open in Browser** - Opens Dashboard in default browser
4. **Status Indicator** - Shows if Dashboard is running (green/gray)

## Notes

- The Dashboard server must be running on localhost:3000
- Use the launch script (`start.sh`) for automatic startup
- The menubar app connects to the running Dashboard instance
- For production, both Dashboard and menubar app should be packaged together

## License

MIT
