# OpenClaw Dashboard - 菜单栏应用

macOS 菜单栏应用，用于管理 OpenClaw Dashboard 服务。

## 功能

- **系统托盘图标** - 在 macOS 菜单栏显示图标
- **服务状态监控** - 实时显示 Dashboard 运行状态
- **服务控制** - 启动/停止 Dashboard 服务
- **快速访问** - 一键在浏览器中打开 Dashboard

## 快速开始

### 启动应用

```bash
cd /Users/alex/openclaw-dashboard/macos-menubar
export PATH="$HOME/.cargo/bin:$PATH"
npx tauri dev
```

### 打包应用

```bash
npm run tauri:build
```

生成的 DMG 文件位于：
```
src-tauri/target/release/bundle/dmg/OpenClaw Dashboard_0.1.0_x64.dmg
```

## 菜单栏功能

点击菜单栏图标后显示的菜单：

1. **服务运行状态** (不可点击)
   - 绿色圆点 + "Dashboard 运行中"
   - 灰色圆点 + "Dashboard 已停止"

2. **启动/停止服务**
   - 服务停止时显示"启动服务"
   - 服务运行时显示"停止服务"

3. **打开 Dashboard**
   - 点击后在浏览器中打开 http://localhost:3000

## 系统要求

- macOS 12+ (Monterey 或更高版本)
- Node.js 18+
- Rust 1.77+

## 开发

### 项目结构

```
macos-menubar/
├── src/                      # React 前端
│   ├── App.tsx              # 菜单组件
│   ├── main.tsx             # 入口文件
│   └── styles.css           # 样式
├── src-tauri/               # Rust 后端
│   ├── src/
│   │   ├── commands.rs      # Tauri 命令
│   │   ├── services.rs      # 服务管理
│   │   └── lib.rs           # 主入口
│   └── tauri.conf.json      # Tauri 配置
└── package.json             # Node 依赖
```

### 技术栈

- **前端**: React 18 + TypeScript + Tailwind CSS
- **后端**: Rust + Tauri 2.0
- **构建**: Vite + Cargo

## 使用说明

### 日常使用

1. 点击菜单栏中的 OpenClaw 图标
2. 查看服务运行状态
3. 点击"启动服务"或"停止服务"
4. 点击"打开 Dashboard"在浏览器中查看界面

### 安装 DMG

1. 下载 `OpenClaw Dashboard_0.1.0_x64.dmg`
2. 双击打开 DMG 文件
3. 将应用拖到 Applications 文件夹
4. 从 Launchpad 或 Applications 启动应用

## 注意事项

- Dashboard 服务运行在 localhost:3000
- 启动服务需要等待 3-5 秒
- 停止服务需要等待 1-2 秒
- 菜单栏图标为白色方块（可自定义）

## 许可证

MIT
