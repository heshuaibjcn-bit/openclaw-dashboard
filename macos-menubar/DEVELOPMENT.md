# OpenClaw Menubar - Development Guide

## Quick Start

### 1. Development Mode

Run the application in development mode:

```bash
cd /Users/alex/openclaw-dashboard/macos-menubar
npm run tauri:dev
```

This will:
- Start the Vite dev server (http://localhost:1420)
- Build and run the Rust backend
- Open the menubar application

### 2. Build for Production

Build the release version:

```bash
npm run tauri:build
```

The built `.app` file will be in:
```
src-tauri/target/release/bundle/dmg/OpenClaw Menubar_0.1.0_x64.dmg
```

### 3. Debug Build

For faster builds during development:

```bash
npm run tauri:build:debug
```

## Architecture

### Frontend (React + Vite)

Located in `src/`:
- **App.tsx**: Main application component with Dashboard controls
- **main.tsx**: React entry point
- **styles.css**: Global styles with Tailwind CSS

### Backend (Rust + Tauri)

Located in `src-tauri/src/`:
- **lib.rs**: Main entry point, sets up Tauri app
- **commands.rs**: Tauri commands exposed to frontend
- **services.rs**: Dashboard service management logic

## Tauri Commands

The following commands are exposed to the frontend:

```rust
// Start the Dashboard service
await invoke('start_dashboard')

// Stop the Dashboard service
await invoke('stop_dashboard')

// Get current Dashboard status
await invoke<DashboardStatus>('get_dashboard_status')

// Open Dashboard in browser
await invoke('open_dashboard')
```

## Configuration

### Tauri Config (`src-tauri/tauri.conf.json`)

Key settings for menubar behavior:
- Window size: 300x400 pixels
- No decorations (borderless)
- Always on top
- Skip taskbar (doesn't show in Dock)
- Transparent background

### Capabilities (`src-tauri/capabilities/default.json`)

Permissions granted to the application:
- `core:default`: Basic window management
- `shell:allow-open`: Open URLs in browser

## Dashboard Integration

### Prerequisites

The OpenClaw Dashboard project must exist at:
```
/Users/alex/openclaw-dashboard
```

### Service Management

The Rust backend manages the Dashboard Next.js dev server:

**Starting:**
```bash
cd /Users/alex/openclaw-dashboard
npm run dev
```

**Stopping:**
```bash
pkill -f "next dev"
```

**Status Check:**
```bash
pgrep -f "next dev"
```

## Development Workflow

### 1. Make Changes

- **Frontend changes**: Edit files in `src/`
- **Backend changes**: Edit files in `src-tauri/src/`

### 2. Test Changes

- Run `npm run tauri:dev` to see changes
- Frontend changes hot-reload automatically
- Backend changes require restart

### 3. Debug

- Rust logs: Check the console output
- Frontend logs: Open DevTools (if enabled in debug mode)

## Troubleshooting

### Issue: "Dashboard directory not found"

**Solution**: Ensure the Dashboard project exists at `/Users/alex/openclaw-dashboard`

### Issue: "npm not found"

**Solution**: Install Node.js from https://nodejs.org/

### Issue: Build fails with Rust errors

**Solution**: Update Rust toolchain
```bash
rustup update
```

### Issue: Window doesn't appear in menubar

**Solution**: Check macOS privacy settings:
1. System Settings → Privacy & Security
2. Ensure "Accessibility" permissions are granted

### Issue: "cargo command not found"

**Solution**: Ensure Rust is installed and PATH is set
```bash
source $HOME/.cargo/env
```

### Issue: Dashboard won't start

**Solution**:
1. Check if port 3000 is already in use: `lsof -i :3000`
2. Kill existing process: `kill -9 <PID>`
3. Try starting manually first: `cd /Users/alex/openclaw-dashboard && npm run dev`

## File Structure

```
macos-menubar/
├── src/                        # React frontend
│   ├── App.tsx                # Main UI component
│   ├── main.tsx               # React entry
│   └── styles.css             # Global styles
├── src-tauri/                 # Rust backend
│   ├── src/
│   │   ├── commands.rs        # Tauri commands
│   │   ├── services.rs        # Service logic
│   │   └── lib.rs             # Entry point
│   ├── capabilities/          # Permissions
│   ├── icons/                 # App icons
│   ├── Cargo.toml             # Rust dependencies
│   └── tauri.conf.json        # Tauri config
├── dist/                       # Built frontend
├── package.json               # Node dependencies
├── vite.config.ts             # Vite config
└── tsconfig.json              # TypeScript config
```

## Next Steps

### Adding New Features

1. **Frontend**: Add new components in `src/components/`
2. **Backend**: Add commands in `commands.rs` and logic in `services.rs`
3. **Permissions**: Update `capabilities/default.json` if needed

### Icon Customization

To update the app icon:
1. Replace icons in `src-tauri/icons/`
2. Run `npm run tauri:build` to regenerate app bundle

### Distribution

For distribution:
1. Update version in `package.json` and `src-tauri/Cargo.toml`
2. Update `src-tauri/tauri.conf.json` with your identifiers
3. Code sign the app (required for distribution outside Mac App Store)
4. Build: `npm run tauri:build`
5. Distribute the generated DMG file

## Resources

- [Tauri Documentation](https://tauri.app/v1/guides/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Next.js Documentation](https://nextjs.org/docs)
