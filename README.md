# 🦞 OpenClaw Dashboard

Modern dashboard for [OpenClaw Gateway](https://docs.openclaw.ai) monitoring and management.

![OpenClaw Dashboard](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)
![shadcn/ui](https://img.shields.io/badge/shadcn/ui-latest)

## Features

### 📊 Dashboard Pages
- **Home** - Overview with stats cards and activity timeline
- **Gateway** - Real-time gateway status and health monitoring
- **Sessions** - Active agent sessions with token usage tracking
- **Agents** - Agent management with configuration editor
- **Channels** - Communication channels monitoring (iMessage, Feishu, Telegram)
- **Logs** - Real-time log streaming with filtering
- **Memory** - LanceDB memory browser with semantic search
- **Chat** - Direct agent interaction interface
- **Settings** - Gateway and agent configuration management

### ✨ Key Features
- 🎨 **Modern UI** - Built with shadcn/ui components
- 🌓 **Dark Mode** - System-aware theme switching
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- ⚡ **Real-time Updates** - Auto-refreshing data with pause/resume
- 🔍 **Search & Filter** - Find what you need quickly
- 💾 **API Integration** - Complete OpenClaw Gateway API client
- 🔄 **Error Handling** - Graceful error boundaries and recovery
- 🎯 **Type-Safe** - Full TypeScript coverage

## Quick Start

### Prerequisites
- Node.js 24+
- OpenClaw Gateway running (default: `http://127.0.0.1:18789`)

### Installation

```bash
# Clone or navigate to the project
cd openclaw-dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the dashboard.

### Configuration

The dashboard will automatically connect to your local OpenClaw Gateway. To configure a different gateway:

1. Go to **Settings**
2. Update **Gateway URL**
3. Optionally add an **Auth Token**

## Project Structure

```
openclaw-dashboard/
├── src/
│   ├── app/
│   │   ├── (dashboard)/     # Dashboard pages with shared layout
│   │   │   ├── layout.tsx    # Sidebar layout with navigation
│   │   │   ├── page.tsx      # Home dashboard
│   │   │   ├── gateway/      # Gateway status page
│   │   │   ├── sessions/     # Sessions management
│   │   │   ├── agents/       # Agent management
│   │   │   ├── channels/     # Channel monitoring
│   │   │   ├── logs/         # Logs viewer
│   │   │   ├── memory/       # Memory browser
│   │   │   ├── chat/         # Chat interface
│   │   │   └── settings/     # Settings page
│   │   ├── layout.tsx        # Root layout with providers
│   │   └── globals.css       # Global styles
│   ├── components/
│   │   ├── ui/               # shadcn/ui components
│   │   ├── theme-provider.tsx
│   │   ├── theme-toggle.tsx
│   │   └── error-boundary.tsx
│   └── lib/
│       └── openclaw/         # OpenClaw API integration
│           ├── types.ts       # TypeScript types
│           ├── api-client.ts  # REST API client
│           ├── ws-client.ts   # WebSocket client
│           ├── react-hooks.tsx # React hooks
│           └── index.ts
├── public/                   # Static assets
├── feature_list.json         # Feature tracking
├── claude-progress.txt       # Development progress
└── init.sh                   # Development setup script
```

## Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Run linting
npm run lint

# Or use the init script
./init.sh start
./init.sh build
./init.sh clean
```

### Adding New Components

The project uses [shadcn/ui](https://ui.shadcn.com) for UI components:

```bash
npx shadcn@latest add [component-name]
```

Available components: button, card, input, badge, table, dialog, dropdown-menu, sidebar, tabs, select, switch, textarea, scroll-area, separator, label, tooltip, and more.

### API Integration

The dashboard includes a complete API client for OpenClaw Gateway:

```typescript
import { getAPIClient, useGatewayHealth, useSessions } from "@/lib/openclaw"

// Use the API client
const client = getAPIClient();
const health = await client.getHealth();

// Use React hooks for automatic updates
function MyComponent() {
  const { data, loading, error } = useGatewayHealth();
  // Component will auto-refresh every 30s
}
```

## Deployment

### Build for Production

```bash
npm run build
npm start
```

The optimized production build will be in the `.next` folder.

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_OPENCLAW_GATEWAY_URL=http://127.0.0.1:18789
NEXT_PUBLIC_OPENCLAW_AUTH_TOKEN=your-token-here
```

### Docker Deployment

```dockerfile
FROM node:24-alpine AS base

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

## Roadmap

### ✅ Completed (20/20 features)
- [x] Project setup with Next.js 15 + TypeScript
- [x] shadcn/ui component library
- [x] Layout with sidebar navigation
- [x] Home dashboard with stats
- [x] OpenClaw API integration layer
- [x] Gateway status page
- [x] Sessions list and detail view
- [x] Agents management page
- [x] Channels monitoring page
- [x] Logs viewer with real-time streaming
- [x] Memory browser for LanceDB
- [x] Chat interface for agent interaction
- [x] Settings configuration page
- [x] Dark mode with theme provider
- [x] Error boundaries and handling
- [x] Responsive design
- [x] Performance optimization
- [x] Error boundary components
- [x] Comprehensive documentation

### 🚀 Future Enhancements
- WebSocket real-time updates
- Advanced analytics charts
- Custom agent configuration
- Plugin system
- Multi-gateway support
- Export functionality
- Notifications system

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Built with [Next.js](https://nextjs.org)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)
- Inspired by [Anthropic's long-running agent research](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)

## Support

For OpenClaw documentation, visit [docs.openclaw.ai](https://docs.openclaw.ai)

For issues and questions, please open an issue on the GitHub repository.
