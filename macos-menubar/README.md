# OpenClaw Menu Bar Application

A macOS menu bar application for controlling the OpenClaw Dashboard service.

## Features

- Start/Stop OpenClaw Dashboard service (Next.js dev server)
- View Dashboard running status
- Quick access to Dashboard (localhost:3000)
- Lightweight menu bar interface

## Development

### Prerequisites

- Node.js 18+
- Rust 1.77+
- OpenClaw Dashboard project located at `/Users/alex/openclaw-dashboard`

### Setup

1. Install dependencies:
```bash
npm install
```

2. Run development mode:
```bash
npm run tauri:dev
```

3. Build for production:
```bash
npm run tauri:build
```

## Project Structure

```
macos-menubar/
├── src/                  # React frontend
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # React entry point
│   └── styles.css       # Global styles
├── src-tauri/           # Rust backend
│   ├── src/
│   │   ├── commands.rs  # Tauri commands
│   │   ├── services.rs  # Dashboard service management
│   │   └── lib.rs       # Main entry point
│   ├── capabilities/    # Tauri permissions
│   └── tauri.conf.json  # Tauri configuration
└── package.json         # Node dependencies
```

## Configuration

The app controls the OpenClaw Dashboard service at:
- **Dashboard URL**: http://localhost:3000
- **Project Path**: `/Users/alex/openclaw-dashboard`

## How It Works

### Starting the Dashboard
The app runs `npm run dev` in the Dashboard project directory to start the Next.js development server.

### Stopping the Dashboard
The app uses `pkill -f "next dev"` to stop the Next.js development server.

### Status Monitoring
The app uses `pgrep -f "next dev"` to check if the Dashboard is running.

## License

MIT
